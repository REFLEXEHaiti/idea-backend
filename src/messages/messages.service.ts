// src/messages/messages.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DebatsGateway } from '../websocket/debats.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway: DebatsGateway,
  ) {}

  async creer(auteurId: string, tenantId: string, data: {
    contenu: string; debatId: string; stance?: string;
  }) {
    const debat = await this.prisma.debat.findFirst({ where: { id: data.debatId, tenantId } });
    if (!debat) throw new NotFoundException('Débat introuvable');
    if (debat.statut !== 'OUVERT') throw new BadRequestException("Ce débat n'est pas ouvert aux messages");

    const message = await this.prisma.message.create({
      data: {
        contenu: data.contenu,
        stance: (data.stance as any) ?? 'NEUTRE',
        auteurId,
        debatId: data.debatId,
      },
      include: { auteur: { select: { id: true, prenom: true, nom: true, role: true } } },
    });

    this.gateway?.diffuserNouveauMessage(data.debatId, message);
    return message;
  }

  async masquer(id: string, userId: string, userRole: string) {
    const message = await this.prisma.message.findUnique({ where: { id }, include: { debat: true } });
    if (!message) throw new NotFoundException('Message introuvable');
    if (message.debat.createurId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Non autorisé');
    }
    return this.prisma.message.update({ where: { id }, data: { visible: false } });
  }

  async supprimer(id: string, userId: string, userRole: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message introuvable');
    if (message.auteurId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Non autorisé');
    }
    return this.prisma.message.delete({ where: { id } });
  }
}
