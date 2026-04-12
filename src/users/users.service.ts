// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, prenom: true, nom: true,
        role: true, actif: true, tenantId: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findByEmailAndTenant(email: string, tenantId: string) {
    return this.prisma.user.findUnique({
      where: { email_tenantId: { email, tenantId } },
    });
  }

  // Lister les users d'un tenant (ADMIN seulement)
  async listerParTenant(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, actif: true },
      select: {
        id: true, email: true, prenom: true, nom: true,
        role: true, ville: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async changerRole(id: string, role: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable dans ce tenant');
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, email: true, prenom: true, nom: true, role: true },
    });
  }

  async desactiver(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable dans ce tenant');
    return this.prisma.user.update({
      where: { id },
      data: { actif: false },
    });
  }
}
