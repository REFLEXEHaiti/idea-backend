import {
  Controller, Post, Get, Body, Headers,
  RawBodyRequest, Req, Request, UseGuards,
} from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  // POST /api/paiements/stripe/session
  @UseGuards(JwtAuthGuard)
  @Post('stripe/session')
  async creerSession(@Request() req: any, @Body() body: { plan: string }) {
    return this.paiementsService.creerSessionStripe(req.user.id, body.plan);
  }

  // POST /api/paiements/stripe/webhook — appelé par Stripe
  @Post('stripe/webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paiementsService.handleWebhookStripe(
      req.rawBody as Buffer,
      signature,
    );
  }

  // POST /api/paiements/moncash/initier
  @UseGuards(JwtAuthGuard)
  @Post('moncash/initier')
  async initierMoncash(
    @Request() req: any,
    @Body() body: { montantHTG: number; plan: string },
  ) {
    return this.paiementsService.initierPaiementMonCash(
      req.user.id,
      body.montantHTG,
      body.plan,
    );
  }

  // GET /api/paiements/statut
  @UseGuards(JwtAuthGuard)
  @Get('statut')
  async getStatut(@Request() req: any) {
    const premium = await this.paiementsService.estPremium(req.user.id);
    return { premium };
  }

  // GET /api/paiements/moncash/verifier?orderId=xxx
  @UseGuards(JwtAuthGuard)
  @Get('moncash/verifier')
  async verifierMoncash(@Request() req: any, @Body() body: { orderId: string }) {
    return this.paiementsService.verifierPaiementMonCash(body.orderId);
  }
}