import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreerLeconDto } from './dto/creer-lecon.dto';

@Injectable()
export class LeconsService {
  private prisma = new PrismaClient();

  async creer(dto: CreerLeconDto) {
    return this.prisma.lecon.create({
      data: dto,
    });
  }

  async findById(id: string) {
    const lecon = await this.prisma.lecon.findUnique({
      where: { id },
      include: { quiz: true, cours: true },
    });
    if (!lecon) throw new NotFoundException('Leçon introuvable');
    return lecon;
  }

  // Marquer une leçon comme terminée
  async marquerTerminee(userId: string, leconId: string) {
    return this.prisma.progressionLecon.upsert({
      where: { userId_leconId: { userId, leconId } },
      update: { termine: true },
      create: { userId, leconId, termine: true },
    });
  }
}