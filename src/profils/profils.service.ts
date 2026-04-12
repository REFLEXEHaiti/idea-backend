// src/profils/profils.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfil(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, prenom: true, nom: true,
        role: true, bio: true, photoUrl: true, ville: true,
        whatsapp: true, langue: true, tenantId: true, createdAt: true,
        _count: {
          select: {
            debats: true, messages: true, votes: true,
            abonnes: true, abonnements: true, inscriptions: true,
          },
        },
        points: { select: { points: true, niveau: true } },
        badges: { select: { id: true, type: true, titre: true, createdAt: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async modifierProfil(userId: string, data: {
    prenom?: string; nom?: string; bio?: string;
    photoUrl?: string; ville?: string; whatsapp?: string; langue?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, prenom: true, nom: true,
        bio: true, photoUrl: true, ville: true, whatsapp: true,
        langue: true, role: true,
      },
    });
  }

  async sabonner(abonneId: string, cibleId: string) {
    if (abonneId === cibleId) throw new Error('Vous ne pouvez pas vous abonner à vous-même');

    const existant = await this.prisma.abonnement.findUnique({
      where: { abonneId_cibleId: { abonneId, cibleId } },
    });

    if (existant) {
      await this.prisma.abonnement.delete({ where: { abonneId_cibleId: { abonneId, cibleId } } });
      return { message: 'Désabonnement effectué', abonne: false };
    }

    await this.prisma.abonnement.create({ data: { abonneId, cibleId } });
    await this.prisma.notification.create({
      data: {
        type: 'NOUVEL_ABONNE', titre: 'Nouvel abonné',
        contenu: "Quelqu'un s'est abonné à votre profil",
        userId: cibleId,
      },
    });
    return { message: 'Abonnement effectué', abonne: true };
  }

  async getAbonnes(userId: string) {
    return this.prisma.abonnement.findMany({
      where: { cibleId: userId },
      include: {
        abonne: { select: { id: true, prenom: true, nom: true, photoUrl: true, role: true } },
      },
    });
  }
}
