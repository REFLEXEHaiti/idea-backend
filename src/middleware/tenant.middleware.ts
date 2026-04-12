// src/middleware/tenant.middleware.ts
// Middleware qui lit le tenant depuis le header X-Tenant-ID ou le sous-domaine
// et l'attache à req['tenantSlug'] pour utilisation dans les services

import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // 1. Priorité au header X-Tenant-ID
    let slug = req.headers['x-tenant-id'] as string;

    // 2. Sinon, détecter via le sous-domaine (lexhaiti.com → "lex")
    if (!slug) {
      const host = req.headers.host ?? '';
      const subdomain = host.split('.')[0];
      const slugMap: Record<string, string> = {
        lexhaiti: 'lex',
        techprohaiti: 'techpro',
        mediformhaiti: 'mediform',
        lex: 'lex',
        techpro: 'techpro',
        mediform: 'mediform',
      };
      slug = slugMap[subdomain] ?? '';
    }

    // 3. En développement, accepter le paramètre de query ?tenant=
    if (!slug && process.env.NODE_ENV !== 'production') {
      slug = (req.query['tenant'] as string) ?? '';
    }

    if (!slug) {
      // Les routes publiques (health, /tenants) passent sans tenant
      req['tenantSlug'] = null;
    } else {
      req['tenantSlug'] = slug.toLowerCase();
    }

    next();
  }
}
