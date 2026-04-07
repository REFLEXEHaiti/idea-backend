// src/auth/jwt-auth.guard.ts
// Guard réutilisable — protège les routes qui nécessitent une connexion
// Utilisation : @UseGuards(JwtAuthGuard) sur un controller ou une méthode

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}