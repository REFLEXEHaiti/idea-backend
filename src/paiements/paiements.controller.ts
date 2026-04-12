// src/paiements/paiements.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  // Tarifs de la plateforme courante
  @Get('tarifs')
  async getTarifs(@Req() req: any) {
    const tenantSlug = req['tenantSlug'] ?? 'lex';
    return this.paiementsService.getTarifs(tenantSlug);
  }

  // Mon abonnement actif
  @Get('mon-abonnement')
  @UseGuards(JwtAuthGuard)
  async monAbonnement(@Req() req: any) {
    return this.paiementsService.monAbonnement(req.user.id);
  }

  // Créer session Stripe
  @Post('stripe/session')
  @UseGuards(JwtAuthGuard)
  async creerSessionStripe(@Body('plan') plan: string, @Req() req: any) {
    const tenantSlug = req.user.tenantSlug ?? req['tenantSlug'] ?? 'lex';
    return this.paiementsService.creerSessionStripe(req.user.id, plan, tenantSlug);
  }

  // Initier paiement MonCash
  @Post('moncash/initier')
  @UseGuards(JwtAuthGuard)
  async initierMonCash(
    @Body('montantHTG') montantHTG: number,
    @Body('plan') plan: string,
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    return this.paiementsService.initierPaiementMonCash(req.user.id, montantHTG, plan, tenantSlug);
  }

  // Vérifier paiement MonCash
  @Post('moncash/verifier')
  @UseGuards(JwtAuthGuard)
  async verifierMonCash(@Body('orderId') orderId: string) {
    return this.paiementsService.verifierPaiementMonCash(orderId);
  }

  // Admin — lister abonnements du tenant
  @Get('admin/abonnements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async listerAbonnements(@Req() req: any) {
    return this.paiementsService.listerAbonnements(req.user.tenantId);
  }

  // Admin — valider paiement manuellement
  @Post('admin/valider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async validerManuellement(@Body() body: {
    userId: string; plan: string; reference: string; methode?: string;
  }) {
    return this.paiementsService.validerPaiementManuellement(
      body.userId, body.plan, body.reference, body.methode,
    );
  }

  // Admin — révoquer abonnement
  @Post('admin/revoquer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async revoquer(@Body('userId') userId: string) {
    return this.paiementsService.revoquerAbonnement(userId);
  }
}
