import { Module } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesController } from './lives.controller';

@Module({
  providers: [LivesService],
  controllers: [LivesController],
})
export class LivesModule {}
