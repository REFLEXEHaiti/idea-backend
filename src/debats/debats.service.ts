// src/debats/debats.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DebatsService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(createurId: string, tenantId: string, data: {
    titre: string; description: string; statut?: string;
    categorie?: string; dateDebut?: string;
  }) {
    return this.prisma.debat.create({
      data: {
        titre: data.titre, description: data.description,
        statut: (data.statut as any) ?? 'BROUILLON',
        categorie: data.categorie,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        createurId, tenantId,
      },
      include: { createur: { select: { id: true, prenom: true, nom: true, role: true } } },
    });
  }

  async listerTous(tenantId: string, page = 1, limite = 10) {
    const skip = (page - 1) * limite;
    const [debats, total] = await Promise.all([
      this.prisma.debat.findMany({
        where: { tenantId },
        skip, take: limite,
        orderBy: { createdAt: 'desc' },
        include: {
          createur: { select: { id: true, prenom: true, nom: true } },
          _count: { select: { messages: true, votesDebat: true } },
        },
      }),
      this.prisma.debat.count({ where: { tenantId } }),
    ]);

    const debatsAvecVotes = await Promise.all(debats.map(async (d) => {
      const [pour, contre] = await Promise.all([
        this.prisma.voteDebat.count({ where: { debatId: d.id, type: 'POUR' } }),
        this.prisma.voteDebat.count({ where: { debatId: d.id, type: 'CONTRE' } }),
      ]);
      const totalVotes = pour + contre;
      return {
        ...d,
        votes: {
          pour, contre, total: totalVotes,
          pourcentagePour: totalVotes > 0 ? Math.round((pour / totalVotes) * 100) : 0,
          pourcentageContre: totalVotes > 0 ? Math.round((contre / totalVotes) * 100) : 0,
        },
      };
    }));

    return { debats: debatsAvecVotes, total, page, totalPages: Math.ceil(total / limite) };
  }

  async findById(id: string, tenantId: string) {
    const debat = await this.prisma.debat.findFirst({
      where: { id, tenantId },
      include: {
        createur: { select: { id: true, prenom: true, nom: true, role: true } },
        messages: {
          where: { visible: true },
          orderBy: { createdAt: 'asc' },
          include: {
            auteur: { select: { id: true, prenom: true, nom: true, role: true } },
            votes: true,
            _count: { select: { votes: true } },
          },
        },
        _count: { select: { messages: true, votesDebat: true } },
      },
    });
    if (!debat) throw new NotFoundException('Débat introuvable');

    const [pour, contre] = await Promise.all([
      this.prisma.voteDebat.count({ where: { debatId: id, type: 'POUR' } }),
      this.prisma.voteDebat.count({ where: { debatId: id, type: 'CONTRE' } }),
    ]);
    const totalVotes = pour + contre;

    await this.prisma.debat.update({ where: { id }, data: { vues: { increment: 1 } } });

    return {
      ...debat,
      votes: {
        pour, contre, total: totalVotes,
        pourcentagePour: totalVotes > 0 ? Math.round((pour / totalVotes) * 100) : 0,
        pourcentageContre: totalVotes > 0 ? Math.round((contre / totalVotes) * 100) : 0,
      },
    };
  }

  async modifier(id: string, userId: string, userRole: string, tenantId: string, data: any) {
    const debat = await this.prisma.debat.findFirst({ where: { id, tenantId } });
    if (!debat) throw new NotFoundException('Débat introuvable');
    if (debat.createurId !== userId && userRole !== 'ADMIN') throw new ForbiddenException('Non autorisé');
    return this.prisma.debat.update({
      where: { id },
      data: { ...data, dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined },
    });
  }

  async supprimer(id: string, tenantId: string) {
    const debat = await this.prisma.debat.findFirst({ where: { id, tenantId } });
    if (!debat) throw new NotFoundException('Débat introuvable');
    return this.prisma.debat.delete({ where: { id } });
  }
}
