// src/sponsoring/sponsoring.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsoringService {
  constructor(private readonly prisma: PrismaService) {}

  async creerSponsor(tenantId: string, data: {
    nom: string; logoUrl: string; siteWeb?: string; description?: string;
    typeContrat: string; montant: number; dateDebut: string; dateFin: string;
  }) {
    return this.prisma.sponsor.create({
      data: {
        ...data,
        typeContrat: data.typeContrat as any,
        dateDebut: new Date(data.dateDebut),
        dateFin: new Date(data.dateFin),
        tenantId,
      },
    });
  }

  async getSponsorsActifs(tenantId: string) {
    const maintenant = new Date();
    return this.prisma.sponsor.findMany({
      where: { tenantId, actif: true, dateDebut: { lte: maintenant }, dateFin: { gte: maintenant } },
      orderBy: { montant: 'desc' },
    });
  }

  async listerTous(tenantId: string) {
    return this.prisma.sponsor.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async modifierSponsor(id: string, tenantId: string, data: any) {
    return this.prisma.sponsor.updateMany({
      where: { id, tenantId },
      data: {
        ...data,
        typeContrat: data.typeContrat as any,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      },
    });
  }

  async supprimerSponsor(id: string, tenantId: string) {
    await this.prisma.sponsorTournoi.deleteMany({ where: { sponsorId: id } });
    return this.prisma.sponsor.deleteMany({ where: { id, tenantId } });
  }

  async associerSponsorTournoi(sponsorId: string, tournoiId: string) {
    return this.prisma.sponsorTournoi.create({
      data: { sponsorId, tournoiId },
      include: { sponsor: true },
    });
  }
}
