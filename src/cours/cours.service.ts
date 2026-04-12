// src/cours/cours.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(createurId: string, tenantId: string, data: {
    titre: string; description: string; niveau?: string;
    imageUrl?: string; categorie?: string;
  }) {
    return this.prisma.cours.create({
      data: { ...data, niveau: (data.niveau as any) ?? 'DEBUTANT', createurId, tenantId },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        _count: { select: { lecons: true } },
      },
    });
  }

  async listerTous(tenantId: string, niveau?: string, categorie?: string) {
    return this.prisma.cours.findMany({
      where: {
        tenantId,
        publie: true,
        ...(niveau ? { niveau: niveau as any } : {}),
        ...(categorie ? { categorie } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        _count: { select: { lecons: true, inscriptions: true } },
      },
    });
  }

  // Admin / Formateur peuvent voir leurs brouillons
  async listerTousAdmin(tenantId: string) {
    return this.prisma.cours.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        _count: { select: { lecons: true, inscriptions: true } },
      },
    });
  }

  async findById(id: string, tenantId: string) {
    const cours = await this.prisma.cours.findFirst({
      where: { id, tenantId },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        lecons: { orderBy: { ordre: 'asc' }, include: { quiz: true } },
        _count: { select: { inscriptions: true } },
      },
    });
    if (!cours) throw new NotFoundException('Cours introuvable');
    return cours;
  }

  async togglePublier(id: string, userId: string, userRole: string, tenantId: string) {
    const cours = await this.prisma.cours.findFirst({ where: { id, tenantId } });
    if (!cours) throw new NotFoundException('Cours introuvable');
    if (cours.createurId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('Non autorisé');
    return this.prisma.cours.update({ where: { id }, data: { publie: !cours.publie } });
  }

  async sInscrire(userId: string, coursId: string, tenantId: string) {
    const cours = await this.prisma.cours.findFirst({ where: { id: coursId, tenantId, publie: true } });
    if (!cours) throw new NotFoundException('Cours introuvable');

    const existant = await this.prisma.inscription.findUnique({
      where: { userId_coursId: { userId, coursId } },
    });
    if (existant) return { message: 'Déjà inscrit', inscription: existant };

    return this.prisma.inscription.create({ data: { userId, coursId } });
  }

  async getProgression(userId: string, coursId: string, tenantId: string) {
    const cours = await this.findById(coursId, tenantId);
    const totalLecons = cours.lecons.length;
    const terminees = await this.prisma.progressionLecon.count({
      where: { userId, leconId: { in: cours.lecons.map((l) => l.id) }, termine: true },
    });
    return {
      totalLecons,
      terminees,
      pourcentage: totalLecons > 0 ? Math.round((terminees / totalLecons) * 100) : 0,
    };
  }

  async mesInscriptions(userId: string) {
    return this.prisma.inscription.findMany({
      where: { userId },
      include: {
        cours: {
          include: {
            _count: { select: { lecons: true } },
            createur: { select: { id: true, prenom: true, nom: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
