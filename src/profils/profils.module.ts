import { Module } from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { ProfilsController } from './profils.controller';

@Module({
  providers: [ProfilsService],
  controllers: [ProfilsController],
  exports: [ProfilsService],
})
export class ProfilsModule {}