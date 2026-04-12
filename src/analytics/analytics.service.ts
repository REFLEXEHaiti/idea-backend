// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tableau de bord admin — métriques du tenant
  async getMetriques(tenantId: string) {
    const [
      totalUtilisateurs,
      totalCours,
      totalLives,
      totalDebats,
      totalMessages,
      totalVotes,
      totalInscriptions,
      debatsOuverts,
      livesEnDirect,
      utilisateursParRole,
      coursRecents,
    ] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.cours.count({ where: { tenantId } }),
      this.prisma.live.count({ where: { tenantId } }),
      this.prisma.debat.count({ where: { tenantId } }),
      this.prisma.message.count({ where: { debat: { tenantId } } }),
      this.prisma.vote.count({ where: { message: { debat: { tenantId } } } }),
      this.prisma.inscription.count({ where: { cours: { tenantId } } }),
      this.prisma.debat.count({ where: { tenantId, statut: 'OUVERT' } }),
      this.prisma.live.count({ where: { tenantId, statut: 'EN_DIRECT' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: { tenantId },
        _count: { role: true },
      }),
      this.prisma.cours.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          titre: true, publie: true, createdAt: true,
          _count: { select: { inscriptions: true, lecons: true } },
        },
      }),
    ]);

    return {
      totaux: {
        utilisateurs: totalUtilisateurs,
        cours: totalCours,
        lives: totalLives,
        debats: totalDebats,
        messages: totalMessages,
        votes: totalVotes,
        inscriptions: totalInscriptions,
        debatsOuverts,
        livesEnDirect,
      },
      utilisateursParRole,
      coursRecents,
    };
  }

  // Top cours par inscriptions
  async getTopCours(tenantId: string) {
    return this.prisma.cours.findMany({
      where: { tenantId, publie: true },
      take: 5,
      orderBy: { inscriptions: { _count: 'desc' } },
      include: {
        createur: { select: { prenom: true, nom: true } },
        _count: { select: { inscriptions: true, lecons: true } },
      },
    });
  }

  // Top contributeurs du tenant
  async getTopContributeurs(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      take: 10,
      orderBy: { points: { points: 'desc' } },
      select: {
        id: true, prenom: true, nom: true, role: true, photoUrl: true,
        points: { select: { points: true, niveau: true } },
        _count: { select: { inscriptions: true, badges: true } },
      },
    });
  }

  // Tableau de bord apprenant
  async getDashboardApprenant(userId: string, tenantId: string) {
    const [inscriptions, resultatsRecents, points, badges, notificationsNonLues] = await Promise.all([
      this.prisma.inscription.findMany({
        where: { userId, cours: { tenantId } },
        include: {
          cours: {
            select: {
              id: true, titre: true, imageUrl: true, niveau: true,
              _count: { select: { lecons: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      this.prisma.resultatQuiz.findMany({
        where: { userId },
        include: { quiz: { include: { lecon: { select: { titre: true, coursId: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.pointsUtilisateur.findUnique({ where: { userId } }),
      this.prisma.badge.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 6 }),
      this.prisma.notification.count({ where: { userId, lue: false } }),
    ]);

    // Calcul de progression pour chaque cours inscrit
    const coursAvecProgression = await Promise.all(inscriptions.map(async (insc) => {
      const totalLecons = insc.cours._count.lecons;
      const terminees = await this.prisma.progressionLecon.count({
        where: { userId, lecon: { coursId: insc.coursId }, termine: true },
      });
      return {
        ...insc,
        progression: { total: totalLecons, terminees, pourcentage: totalLecons > 0 ? Math.round((terminees / totalLecons) * 100) : 0 },
      };
    }));

    return {
      inscriptions: coursAvecProgression,
      resultatsRecents,
      points,
      badges,
      notificationsNonLues,
    };
  }
}
