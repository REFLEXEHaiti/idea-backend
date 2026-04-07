import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async create(data: {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role?: Role;
  }) {
    const motDePasseHache = await bcrypt.hash(data.motDePasse, 12);
    return this.prisma.user.create({
      data: { ...data, motDePasse: motDePasseHache },
      select: { id: true, email: true, prenom: true, nom: true, role: true, createdAt: true },
    });
  }

  async verifierMotDePasse(motDePasse: string, hash: string): Promise<boolean> {
    return bcrypt.compare(motDePasse, hash);
  }
}
