// src/debats/debats.service.ts
// CORRECTION : remplace `private prisma = new PrismaClient()`
// par l'injection de PrismaService via le constructeur.
// Même pattern à appliquer dans TOUS les autres services :
// votes.service.ts, messages.service.ts, notifications.service.ts,
// profils.service.ts, cours.service.ts, lecons.service.ts, etc.

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreerDebatDto } from './dto/creer-debat.dto';
import { ModifierDebatDto } from './dto/modifier-debat.dto';

@Injectable()
export class DebatsService {
  // AVANT : private prisma = new PrismaClient();  ← crée une nouvelle connexion
  // APRÈS : injection du singleton partagé        ← une seule connexion réutilisée
  constructor(private readonly prisma: PrismaService) {}

  async creer(createurId: string, dto: CreerDebatDto) {
    return this.prisma.debat.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        statut: dto.statut ?? 'BROUILLON',
        createurId,
      },
      include: {
        createur: {
          select: { id: true, prenom: true, nom: true, role: true },
        },
      },
    });
  }

  async listerTous(page: number = 1, limite: number = 10) {
    const skip = (page - 1) * limite;

    const [debats, total] = await Promise.all([
      this.prisma.debat.findMany({
        skip,
        take: limite,
        orderBy: { createdAt: 'desc' },
        include: {
          createur: {
            select: { id: true, prenom: true, nom: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.debat.count(),
    ]);

    return {
      debats,
      total,
      page,
      totalPages: Math.ceil(total / limite),
    };
  }

  async findById(id: string) {
    const debat = await this.prisma.debat.findUnique({
      where: { id },
      include: {
        createur: {
          select: { id: true, prenom: true, nom: true, role: true },
        },
        messages: {
          where: { visible: true },
          orderBy: { createdAt: 'asc' },
          include: {
            auteur: {
              select: { id: true, prenom: true, nom: true, role: true },
            },
            votes: true,
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!debat) throw new NotFoundException('Débat introuvable');
    return debat;
  }

  async modifier(id: string, userId: string, userRole: string, dto: ModifierDebatDto) {
    const debat = await this.prisma.debat.findUnique({ where: { id } });
    if (!debat) throw new NotFoundException('Débat introuvable');

    if (debat.createurId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce débat');
    }

    return this.prisma.debat.update({
      where: { id },
      data: dto,
    });
  }

  async supprimer(id: string) {
    const debat = await this.prisma.debat.findUnique({ where: { id } });
    if (!debat) throw new NotFoundException('Débat introuvable');

    return this.prisma.debat.delete({ where: { id } });
  }
}
