// src/lecons/lecons.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeconsService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(data: {
    titre: string; contenu: string; ordre: number;
    dureeMin?: number; pdfUrl?: string; videoUrl?: string; coursId: string;
  }) {
    // Vérifier que le cours existe
    const cours = await this.prisma.cours.findUnique({ where: { id: data.coursId } });
    if (!cours) throw new NotFoundException('Cours introuvable');
    return this.prisma.lecon.create({ data });
  }

  async findById(id: string) {
    const lecon = await this.prisma.lecon.findUnique({
      where: { id },
      include: { quiz: true, cours: { select: { id: true, titre: true, tenantId: true } } },
    });
    if (!lecon) throw new NotFoundException('Leçon introuvable');
    return lecon;
  }

  async modifier(id: string, data: Partial<{
    titre: string; contenu: string; ordre: number;
    dureeMin: number; pdfUrl: string; videoUrl: string;
  }>) {
    return this.prisma.lecon.update({ where: { id }, data });
  }

  async supprimer(id: string) {
    return this.prisma.lecon.delete({ where: { id } });
  }

  async marquerTerminee(userId: string, leconId: string) {
    return this.prisma.progressionLecon.upsert({
      where: { userId_leconId: { userId, leconId } },
      update: { termine: true },
      create: { userId, leconId, termine: true },
    });
  }
}
