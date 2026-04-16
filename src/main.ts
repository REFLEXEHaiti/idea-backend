// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Middleware raw body pour Stripe webhook — doit être avant NestFactory
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3001;
  const frontendUrl = configService.get<string>('frontend.url') ?? '';

  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  app.setGlobalPrefix('api');

  // ── CORS multi-tenant ──
  // Accepte les domaines des 3 plateformes + localhost en dev
  const originesAutorisees: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    // Domaines production des 3 plateformes
    'https://lexhaiti.com',
    'https://www.lexhaiti.com',
    'https://techprohaiti.com',
    'https://www.techprohaiti.com',
    'https://mediformhaiti.com',
    'https://www.mediformhaiti.com',
  ];

  // Ajouter les URLs configurées (séparées par virgule)
  if (frontendUrl) {
    frontendUrl.split(',').map((u) => u.trim()).forEach((url) => {
      originesAutorisees.push(url);
    });
  }

  // En dev : accepter tous les sous-domaines vercel.app et localhost
  if (true) {
    originesAutorisees.push(/\.vercel\.app$/);
    originesAutorisees.push(/localhost:\d+$/);
  }

  app.enableCors({
    origin:         originesAutorisees,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials:    true,
  });

  await app.listen(port);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          IDEA HAITI — Backend Multi-Tenant            ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  URL     : http://localhost:${port}/api`);
  console.log(`  Env     : ${configService.get('nodeEnv')}`);
  console.log(`  Tenants : lex | techpro | mediform`);
  console.log(`  Header  : X-Tenant-ID: <slug>`);
  console.log('');
}

bootstrap();
