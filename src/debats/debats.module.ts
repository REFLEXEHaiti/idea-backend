import { Module } from '@nestjs/common';
import { DebatsService } from './debats.service';
import { DebatsController } from './debats.controller';

@Module({
  providers: [DebatsService],
  controllers: [DebatsController],
})
export class DebatsModule {}
