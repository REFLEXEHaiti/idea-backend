import { Module } from '@nestjs/common';
import { TournoisService } from './tournois.service';
import { TournoisController } from './tournois.controller';

@Module({
  providers: [TournoisService],
  controllers: [TournoisController],
  exports: [TournoisService],
})
export class TournoisModule {}