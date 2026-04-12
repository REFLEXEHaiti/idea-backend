import { Module } from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { ProfilsController } from './profils.controller';

@Module({
  providers: [ProfilsService],
  controllers: [ProfilsController],
})
export class ProfilsModule {}
