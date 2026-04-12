// src/tenants/tenants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(data: {
    nom: string;
    slug: string;
    description?: string;
    domaineWeb?: string;
    couleursThemeJson?: any;
    modulesActifsJson?: any;
    emailContact?: string;
    sloganCourt?: string;
    partenairesJson?: any;
    pays?: string;
    langue?: string;
  }) {
    return this.prisma.tenant.create({ data: { ...data, plateforme: 'idea' } });
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Organisation introuvable');
    return tenant;
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
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

  // Retourne la config publique d'un tenant (utilisée par le frontend au boot)
  async configPublique(slug: string) {
    const tenant = await this.findBySlug(slug);
    return {
      id: tenant.id,
      nom: tenant.nom,
      slug: tenant.slug,
      description: tenant.description,
      logoUrl: tenant.logoUrl,
      domaineWeb: tenant.domaineWeb,
      couleursTheme: tenant.couleursThemeJson,
      modulesActifs: tenant.modulesActifsJson,
      sloganCourt: tenant.sloganCourt,
      partenaires: tenant.partenairesJson,
      emailContact: tenant.emailContact,
      langue: tenant.langue,
      pays: tenant.pays,
    };
  }

  // Vérifie si un module est actif pour un tenant
  async moduleActif(slug: string, module: string): Promise<boolean> {
    const tenant = await this.findBySlug(slug);
    const modules = tenant.modulesActifsJson as Record<string, boolean> | null;
    if (!modules) return true; // par défaut tout est actif
    return modules[module] === true;
  }
}
