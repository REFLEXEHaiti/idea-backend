import { Module } from '@nestjs/common';
import { LeconsService } from './lecons.service';
import { LeconsController } from './lecons.controller';

@Module({
  providers: [LeconsService],
  controllers: [LeconsController],
})
export class LeconsModule {}