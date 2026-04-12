// src/lives/lives.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LivesService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(createurId: string, tenantId: string, data: {
    titre: string; description: string; dateDebut: string;
    youtubeUrl?: string; miniatureUrl?: string;
  }) {
    return this.prisma.live.create({
      data: { ...data, dateDebut: new Date(data.dateDebut), createurId, tenantId },
      include: { createur: { select: { id: true, prenom: true, nom: true } } },
    });
  }

  async listerTous(tenantId: string) {
    return this.prisma.live.findMany({
      where: { tenantId },
      orderBy: { dateDebut: 'desc' },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        _count: { select: { messagesLive: true } },
      },
    });
  }

  async findById(id: string, tenantId: string) {
    const live = await this.prisma.live.findFirst({
      where: { id, tenantId },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        messagesLive: {
          orderBy: { createdAt: 'asc' }, take: 100,
          include: { auteur: { select: { id: true, prenom: true, nom: true } } },
        },
      },
    });
    if (!live) throw new NotFoundException('Live introuvable');
    await this.prisma.live.update({ where: { id }, data: { vues: { increment: 1 } } });
    return live;
  }

  async mettreAJourStatut(id: string, statut: string, replayUrl?: string) {
    return this.prisma.live.update({
      where: { id },
      data: { statut: statut as any, ...(replayUrl ? { replayUrl } : {}) },
    });
  }

  async envoyerMessageChat(auteurId: string, liveId: string, contenu: string) {
    return this.prisma.messageLive.create({
      data: { auteurId, liveId, contenu },
      include: { auteur: { select: { id: true, prenom: true, nom: true } } },
    });
  }

  async supprimer(id: string) {
    await this.prisma.messageLive.deleteMany({ where: { liveId: id } });
    return this.prisma.live.delete({ where: { id } });
  }
}
