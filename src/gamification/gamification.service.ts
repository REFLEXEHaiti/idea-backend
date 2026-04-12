// src/gamification/gamification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async ajouterPoints(userId: string, points: number) {
    const pointsUtilisateur = await this.prisma.pointsUtilisateur.upsert({
      where: { userId },
      update: { points: { increment: points } },
      create: { userId, points },
    });

    const nouveauNiveau = Math.floor(pointsUtilisateur.points / 100) + 1;
    if (nouveauNiveau > pointsUtilisateur.niveau) {
      await this.prisma.pointsUtilisateur.update({
        where: { userId },
        data: { niveau: nouveauNiveau },
      });
      await this.prisma.notification.create({
        data: {
          type: 'BADGE_OBTENU',
          titre: `Niveau ${nouveauNiveau} atteint !`,
          contenu: `Félicitations ! Vous avez atteint le niveau ${nouveauNiveau}.`,
          userId,
        },
      });
    }
    return pointsUtilisateur;
  }

  async attribuerBadge(userId: string, type: string) {
    const existant = await this.prisma.badge.findFirst({ where: { userId, type: type as any } });
    if (existant) return existant;

    const infoBadge = this.getInfoBadge(type);
    const badge = await this.prisma.badge.create({
      data: { type: type as any, titre: infoBadge.titre, description: infoBadge.description, userId },
    });
    await this.prisma.notification.create({
      data: {
        type: 'BADGE_OBTENU',
        titre: `Badge obtenu : ${infoBadge.titre}`,
        contenu: infoBadge.description,
        userId,
      },
    });
    return badge;
  }

  async verifierBadges(userId: string) {
    const stats = await this.getStatsUtilisateur(userId);

    if (stats.messages >= 1) {
      await this.attribuerBadge(userId, 'PREMIER_DEBAT');
      await this.ajouterPoints(userId, 10);
    }
    if (stats.messages >= 100) {
      await this.attribuerBadge(userId, 'CONTRIBUTEUR');
      await this.ajouterPoints(userId, 50);
    }
    if (stats.votes >= 50) {
      await this.attribuerBadge(userId, 'VOTEUR_ACTIF');
      await this.ajouterPoints(userId, 30);
    }
    if (stats.inscriptions >= 1) {
      await this.attribuerBadge(userId, 'PREMIER_COURS');
      await this.ajouterPoints(userId, 15);
    }
    if (stats.inscriptions >= 10) {
      await this.attribuerBadge(userId, 'ASSIDU');
      await this.ajouterPoints(userId, 40);
    }
  }

  async getStatsUtilisateur(userId: string) {
    const [messages, votes, debats, inscriptions, badges, points] = await Promise.all([
      this.prisma.message.count({ where: { auteurId: userId } }),
      this.prisma.vote.count({ where: { votantId: userId } }),
      this.prisma.debat.count({ where: { createurId: userId } }),
      this.prisma.inscription.count({ where: { userId } }),
      this.prisma.badge.findMany({ where: { userId } }),
      this.prisma.pointsUtilisateur.findUnique({ where: { userId } }),
    ]);
    return { messages, votes, debats, inscriptions, badges, points };
  }

  async getClassement(tenantId: string, limite = 10) {
  return this.prisma.pointsUtilisateur.findMany({
    take: limite,
    where: {
      user: { tenantId },        // ← filtre tenant ici
    },
    orderBy: { points: 'desc' },
    include: {
      user: {
        select: { id: true, prenom: true, nom: true, photoUrl: true, role: true },
      },
    },
  });
}

  async getChallengesActifs(tenantId: string) {
    const maintenant = new Date();
    return this.prisma.challenge.findMany({
      where: { tenantId, actif: true, dateDebut: { lte: maintenant }, dateFin: { gte: maintenant } },
    });
  }

  async creerChallenge(tenantId: string, data: {
    titre: string; description: string; pointsRecompense: number;
    dateDebut: string; dateFin: string;
  }) {
    return this.prisma.challenge.create({
      data: {
        ...data,
        dateDebut: new Date(data.dateDebut),
        dateFin: new Date(data.dateFin),
        tenantId,
      },
    });
  }

  private getInfoBadge(type: string) {
    const badges: Record<string, { titre: string; description: string }> = {
      PREMIER_DEBAT:    { titre: 'Premier Débat',       description: 'Vous avez participé à votre premier débat !' },
      RHETEUR_ARGENTE:  { titre: 'Rhéteur Argenté',     description: 'Vous avez participé à 10 débats.' },
      RHETEUR_OR:       { titre: "Rhéteur d'Or",         description: 'Vous avez participé à 50 débats.' },
      CONTRIBUTEUR:     { titre: 'Grand Contributeur',  description: 'Vous avez posté 100 messages.' },
      VOTEUR_ACTIF:     { titre: 'Voteur Actif',         description: 'Vous avez donné 50 votes.' },
      CHAMPION:         { titre: 'Champion',             description: 'Vous avez remporté un tournoi !' },
      FORMATEUR_ETOILE: { titre: 'Formateur Étoile',    description: 'Votre cours a été très apprécié.' },
      PREMIER_COURS:    { titre: 'Premier Cours',        description: 'Vous avez suivi votre premier cours !' },
      ASSIDU:           { titre: 'Assidu',               description: 'Vous avez suivi 10 cours.' },
      EXPERT:           { titre: 'Expert',               description: 'Vous avez terminé 25 cours avec succès.' },
    };
    return badges[type] ?? { titre: type, description: '' };
  }
}
