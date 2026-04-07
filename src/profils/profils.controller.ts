import {
  Controller, Get, Patch, Post,
  Param, Body, Request, UseGuards,
} from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { ModifierProfilDto } from './dto/modifier-profil.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profils')
export class ProfilsController {
  constructor(private readonly profilsService: ProfilsService) {}

  // GET /api/profils/:id — voir le profil d'un utilisateur
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProfil(@Param('id') id: string) {
    return this.profilsService.getProfil(id);
  }

  // PATCH /api/profils/moi — modifier son propre profil
  @UseGuards(JwtAuthGuard)
  @Patch('moi')
  async modifierProfil(
    @Request() req: any,
    @Body() dto: ModifierProfilDto,
  ) {
    return this.profilsService.modifierProfil(req.user.id, dto);
  }

  // POST /api/profils/:id/abonner — s'abonner ou se désabonner
  @UseGuards(JwtAuthGuard)
  @Post(':id/abonner')
  async sabonner(@Request() req: any, @Param('id') cibleId: string) {
    return this.profilsService.sabonner(req.user.id, cibleId);
  }

  // GET /api/profils/:id/abonnes — voir les abonnés
  @UseGuards(JwtAuthGuard)
  @Get(':id/abonnes')
  async getAbonnes(@Param('id') id: string) {
    return this.profilsService.getAbonnes(id);
  }
}