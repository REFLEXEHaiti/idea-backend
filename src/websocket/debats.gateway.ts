// src/websocket/debats.gateway.ts
// Gateway WebSocket — supporte le multi-tenant via rooms nommées tenant:debatId
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/debats',
})
export class DebatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DebatsGateway.name);
  private spectateurs = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
    this.spectateurs.forEach((clients, roomKey) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.broadcastSpectateurs(roomKey);
      }
    });
  }

  @SubscribeMessage('rejoindre-debat')
  handleRejoindre(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { debatId: string; tenantSlug?: string },
  ) {
    const roomKey = data.tenantSlug ? `${data.tenantSlug}:debat:${data.debatId}` : `debat:${data.debatId}`;
    client.join(roomKey);
    if (!this.spectateurs.has(roomKey)) this.spectateurs.set(roomKey, new Set());
    this.spectateurs.get(roomKey)!.add(client.id);
    this.broadcastSpectateurs(roomKey);
    this.logger.log(`Client ${client.id} a rejoint ${roomKey}`);
  }

  @SubscribeMessage('quitter-debat')
  handleQuitter(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { debatId: string; tenantSlug?: string },
  ) {
    const roomKey = data.tenantSlug ? `${data.tenantSlug}:debat:${data.debatId}` : `debat:${data.debatId}`;
    client.leave(roomKey);
    this.spectateurs.get(roomKey)?.delete(client.id);
    this.broadcastSpectateurs(roomKey);
  }

  // Rejoindre un live
  @SubscribeMessage('rejoindre-live')
  handleRejoindreLive(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { liveId: string; tenantSlug?: string },
  ) {
    const roomKey = data.tenantSlug ? `${data.tenantSlug}:live:${data.liveId}` : `live:${data.liveId}`;
    client.join(roomKey);
    this.logger.log(`Client ${client.id} a rejoint live ${roomKey}`);
  }

  // ── Méthodes appelées par les services ──

  diffuserNouveauMessage(debatId: string, message: any) {
    // Diffuse vers toutes les rooms qui contiennent cet debatId
    this.server.to(`debat:${debatId}`).emit('nouveau-message', message);
    // Cherche aussi les rooms avec tenant prefix
    this.spectateurs.forEach((_, roomKey) => {
      if (roomKey.includes(`debat:${debatId}`)) {
        this.server.to(roomKey).emit('nouveau-message', message);
      }
    });
  }

  diffuserVotesDebat(debatId: string, stats: any) {
    this.server.to(`debat:${debatId}`).emit('votes-mis-a-jour', stats);
  }

  diffuserStatutDebat(debatId: string, statut: string) {
    this.server.to(`debat:${debatId}`).emit('statut-debat', { debatId, statut });
  }

  diffuserMessageLive(liveId: string, message: any) {
    this.server.to(`live:${liveId}`).emit('nouveau-message-live', message);
  }

  private broadcastSpectateurs(roomKey: string) {
    const count = this.spectateurs.get(roomKey)?.size ?? 0;
    this.server.to(roomKey).emit('spectateurs', { roomKey, count });
  }
}
