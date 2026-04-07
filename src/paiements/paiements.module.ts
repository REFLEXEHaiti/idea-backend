import { Module } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { StripeController } from './stripe.controller';

@Module({
  providers: [PaiementsService],
  controllers: [PaiementsController, StripeController],
})
export class PaiementsModule {}
