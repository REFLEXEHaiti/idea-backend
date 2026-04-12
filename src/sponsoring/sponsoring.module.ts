import { Module } from '@nestjs/common';
import { SponsoringService } from './sponsoring.service';
import { SponsoringController } from './sponsoring.controller';

@Module({
  providers: [SponsoringService],
  controllers: [SponsoringController],
})
export class SponsoringModule {}
