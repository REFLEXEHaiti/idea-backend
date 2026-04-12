// src/tournois/tournois.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class TournoisService {
  private anthropic: Anthropic;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('anthropic.apiKey'),
    });
  }

  async creer(createurId: string, tenantId: string, data: {
    nom: string; description: string; maxEquipes?: number;
    dateDebut: string; prixInscription?: number;
  }) {
    return this.prisma.tournoi.create({
      data: { ...data, dateDebut: new Date(data.dateDebut), createurId, tenantId },
      include: { createur: { select: { id: true, prenom: true, nom: true } } },
    });
  }

  async listerTous(tenantId: string) {
    return this.prisma.tournoi.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        _count: { select: { equipes: true, matchs: true } },
      },
    });
  }

  async findById(id: string, tenantId: string) {
    const tournoi = await this.prisma.tournoi.findFirst({
      where: { id, tenantId },
      include: {
        createur: { select: { id: true, prenom: true, nom: true } },
        equipes: {
          include: {
            capitaine: { select: { id: true, prenom: true, nom: true } },
            membres: { include: { user: { select: { id: true, prenom: true, nom: true } } } },
          },
        },
        matchs: {
          orderBy: [{ round: 'asc' }, { dateMatch: 'asc' }],
          include: {
            equipe1: { select: { id: true, nom: true } },
            equipe2: { select: { id: true, nom: true } },
          },
        },
      },
    });
    if (!tournoi) throw new NotFoundException('Tournoi introuvable');
    return tournoi;
  }

  async inscrireEquipe(capitaineId: string, tenantId: string, data: {
    nom: string; tournoiId: string; membresIds?: string[];
  }) {
    const tournoi = await this.prisma.tournoi.findFirst({
      where: { id: data.tournoiId, tenantId },
      include: { _count: { select: { equipes: true } } },
    });
    if (!tournoi) throw new NotFoundException('Tournoi introuvable');
    if (tournoi.statut !== 'INSCRIPTION') throw new BadRequestException('Les inscriptions sont fermées');
    if (tournoi._count.equipes >= tournoi.maxEquipes) throw new BadRequestException('Le tournoi est complet');

    return this.prisma.equipe.create({
      data: {
        nom: data.nom,
        tournoiId: data.tournoiId,
        capitaineId,
        membres: {
          create: [
            { userId: capitaineId },
            ...(data.membresIds ?? [])
              .filter((id) => id !== capitaineId)
              .map((userId) => ({ userId })),
          ],
        },
      },
      include: {
        membres: true,
        capitaine: { select: { id: true, prenom: true, nom: true } },
      },
    });
  }

  async genererCalendrier(tournoiId: string, tenantId: string) {
    const tournoi = await this.findById(tournoiId, tenantId);
    if (tournoi.statut !== 'INSCRIPTION') throw new BadRequestException('Calendrier déjà généré');
    if (tournoi.equipes.length < 4) throw new BadRequestException('Il faut au moins 4 équipes');

    const equipes = [...tournoi.equipes].sort(() => Math.random() - 0.5);
    const matchsACreer: any[] = [];
    const dateDebut = new Date(tournoi.dateDebut);

    for (let i = 0; i < equipes.length; i += 2) {
      if (equipes[i + 1]) {
        const sujet = await this.tirerSujetIA(tenantId);
        const dateMatch = new Date(dateDebut);
        dateMatch.setDate(dateDebut.getDate() + Math.floor(i / 2) * 7);
        matchsACreer.push({
          tournoiId, equipe1Id: equipes[i].id, equipe2Id: equipes[i + 1].id,
          sujet, round: 1, dateMatch, statut: 'PROGRAMME',
        });
      }
    }

    await this.prisma.match.createMany({ data: matchsACreer });
    await this.prisma.tournoi.update({ where: { id: tournoiId }, data: { statut: 'EN_COURS' } });
    return this.findById(tournoiId, tenantId);
  }

  async tirerSujetIA(tenantId?: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Tu es expert en débat juridique et politique en Haïti.
Génère UN sujet de débat percutant, actuel et pertinent pour le contexte juridique haïtien.
Le sujet doit être formulé comme une proposition (Pour ou Contre).
Format : "La peine de mort devrait être rétablie en Haïti"
Réponds UNIQUEMENT avec le sujet, sans guillemets, sans explication.`,
        }],
      });
      return (message.content[0] as any).text.trim();
    } catch {
      const sujets = [
        "L'éducation gratuite devrait être garantie par l'État haïtien",
        'La peine de mort devrait être rétablie pour les crimes de guerre en Haïti',
        'Le créole haïtien devrait être la seule langue officielle',
        'Les élections haïtiennes devraient être supervisées par la communauté internationale',
        'La diaspora haïtienne devrait avoir le droit de vote aux élections nationales',
      ];
      return sujets[Math.floor(Math.random() * sujets.length)];
    }
  }

  async enregistrerResultat(matchId: string, scoreEquipe1: number, scoreEquipe2: number, tenantId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournoi: true },
    });
    if (!match) throw new NotFoundException('Match introuvable');
    if (match.tournoi.tenantId !== tenantId) throw new NotFoundException('Match introuvable');
    if (match.statut === 'TERMINE') throw new BadRequestException('Ce match est déjà terminé');
    if (scoreEquipe1 === scoreEquipe2) throw new BadRequestException("Pas d'égalité possible en débat");

    const gagnantId = scoreEquipe1 > scoreEquipe2 ? match.equipe1Id : match.equipe2Id;
    await this.prisma.match.update({
      where: { id: matchId },
      data: { scoreEquipe1, scoreEquipe2, gagnantId, statut: 'TERMINE' },
    });

    const tousMatchsRound = await this.prisma.match.findMany({
      where: { tournoiId: match.tournoiId, round: match.round },
    });
    const tousTermines = tousMatchsRound.every((m) => m.id === matchId ? true : m.statut === 'TERMINE');
    if (tousTermines) await this.genererProchainRound(match.tournoiId, match.round, tenantId);

    return this.findById(match.tournoiId, tenantId);
  }

  private async genererProchainRound(tournoiId: string, roundActuel: number, tenantId: string) {
    const matchsRound = await this.prisma.match.findMany({
      where: { tournoiId, round: roundActuel, statut: 'TERMINE' },
    });
    const gagnantEquipeIds = matchsRound.map((m) => m.gagnantId).filter(Boolean) as string[];

    if (gagnantEquipeIds.length <= 1) {
      const gagnantEquipe = gagnantEquipeIds[0]
        ? await this.prisma.equipe.findUnique({ where: { id: gagnantEquipeIds[0] } })
        : null;
      await this.prisma.tournoi.update({ where: { id: tournoiId }, data: { statut: 'TERMINE', dateFin: new Date() } });
      if (gagnantEquipe) {
        await this.prisma.notification.create({
          data: {
            type: 'MENTION', titre: 'Champion du tournoi !',
            contenu: `L'équipe "${gagnantEquipe.nom}" a remporté le tournoi !`,
            userId: gagnantEquipe.capitaineId,
          },
        });
      }
      return;
    }

    const prochainRound = roundActuel + 1;
    const matchsACreer: any[] = [];
    const dateBase = new Date();
    for (let i = 0; i < gagnantEquipeIds.length; i += 2) {
      if (gagnantEquipeIds[i + 1]) {
        const sujet = await this.tirerSujetIA(tenantId);
        const dateMatch = new Date(dateBase);
        dateMatch.setDate(dateBase.getDate() + 7);
        matchsACreer.push({
          tournoiId, equipe1Id: gagnantEquipeIds[i], equipe2Id: gagnantEquipeIds[i + 1],
          sujet, round: prochainRound, dateMatch, statut: 'PROGRAMME',
        });
      }
    }
    if (matchsACreer.length > 0) await this.prisma.match.createMany({ data: matchsACreer });
  }
}
