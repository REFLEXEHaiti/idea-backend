// src/prisma/prisma.module.ts
// Module global — importer une seule fois dans AppModule.
// Tous les autres modules pourront injecter PrismaService directement
// sans avoir à importer PrismaModule eux-mêmes.

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
