// src/middleware/tenant-id.middleware.ts
// Résout le tenant_id depuis le slug posé par TenantMiddleware
// et l'attache à req['tenantId'] pour utilisation dans les controllers/services

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantIdMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const slug = req['tenantSlug'] as string | null;
    if (slug) {
      try {
        const tenant = await this.prisma.tenant.findUnique({
          where: { slug },
          select: { id: true },
        });
        if (tenant) req['tenantId'] = tenant.id;
      } catch {
        // Silencieux — la validation se fait dans les services
      }
    }
    next();
  }
}
