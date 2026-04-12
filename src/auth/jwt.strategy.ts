// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? '',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
  }) {
    const utilisateur = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        role: true,
        actif: true,
        tenantId: true,
        createdAt: true,
      },
    });
    if (!utilisateur || !utilisateur.actif) {
      throw new UnauthorizedException('Token invalide ou compte inactif');
    }
    // Attacher le tenantSlug depuis le payload pour utilisation dans les services
    return { ...utilisateur, tenantSlug: payload.tenantSlug };
  }
}
