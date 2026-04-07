import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TenantsService {
  private prisma = new PrismaClient();

  async creer(data: {
    nom: string;
    slug: string;
    description?: string;
    pays?: string;
    langue?: string;
  }) {
    return this.prisma.tenant.create({ data });
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Organisation introuvable');
    return tenant;
  }

  async listerTous() {
    return this.prisma.tenant.findMany({
      where: { actif: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mettreAJour(id: string, data: any) {
    return this.prisma.tenant.update({ where: { id }, data });
  }
}
