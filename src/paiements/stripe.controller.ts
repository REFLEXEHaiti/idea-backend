// src/paiements/stripe.controller.ts
// Webhook Stripe — route séparée pour recevoir les événements Stripe
// Doit être enregistré hors du préfixe global /api si besoin

import { Controller, Post, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { Request } from 'express';

@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paiementsService.handleWebhookStripe(req['rawBody'] ?? Buffer.from(''), signature);
  }
}
