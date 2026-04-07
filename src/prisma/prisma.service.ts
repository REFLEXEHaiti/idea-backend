// src/prisma/prisma.service.ts
// CORRECTION : remplace les multiples `new PrismaClient()` dispersés
// dans chaque service. Un seul PrismaService est instancié et partagé
// via l'injection de dépendances NestJS — évite la saturation du pool
// de connexions PostgreSQL en production.

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
