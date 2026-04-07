// src/users/users.controller.ts
// Gère les routes HTTP liées aux utilisateurs
// Route de base : GET /api/users/profil (utilisateur connecté)

import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/profil — retourne le profil de l'utilisateur connecté
  // Protégé : nécessite un token JWT valide dans le header Authorization
  @UseGuards(JwtAuthGuard)
  @Get('profil')
  async monProfil(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  // GET /api/users/:id — retourne le profil d'un utilisateur par ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}