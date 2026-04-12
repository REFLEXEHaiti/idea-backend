import { Module } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { StripeWebhookController } from './stripe.controller';

@Module({
  providers: [PaiementsService],
  controllers: [PaiementsController, StripeWebhookController],
  exports: [PaiementsService],
})
export class PaiementsModule {}
