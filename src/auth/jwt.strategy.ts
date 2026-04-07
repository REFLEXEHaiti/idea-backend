// src/auth/jwt.strategy.ts
// Stratégie Passport pour valider les tokens JWT sur chaque requête protégée
// Ce fichier "explique" à NestJS comment lire et vérifier un JWT

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extrait le token depuis le header : Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // rejette les tokens expirés
      secretOrKey: configService.get<string>('jwt.secret') ?? '',
    });
  }

  // Appelée automatiquement après validation du token
  // La valeur retournée est injectée dans req.user
  async validate(payload: { sub: string; email: string; role: string }) {
    const utilisateur = await this.usersService.findById(payload.sub);
    if (!utilisateur) {
      throw new UnauthorizedException('Token invalide');
    }
    return utilisateur; // accessible via @Request() req → req.user
  }
}