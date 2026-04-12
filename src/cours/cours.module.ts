import { Module } from '@nestjs/common';
import { CoursService } from './cours.service';
import { CoursController } from './cours.controller';

@Module({
  providers: [CoursService],
  controllers: [CoursController],
  exports: [CoursService],
})
export class CoursModule {}
