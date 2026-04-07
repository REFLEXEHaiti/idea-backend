import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { CreerLiveDto } from './dto/creer-live.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsString, IsOptional } from 'class-validator';

class EnvoyerMessageDto {
  @IsString()
  contenu: string;
}

class MettreAJourStatutDto {
  @IsString()
  statut: string;

  @IsString()
  @IsOptional()
  replayUrl?: string;
}

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  // POST /api/lives — ADMIN et FORMATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Request() req: any, @Body() dto: CreerLiveDto) {
    return this.livesService.creer(req.user.id, dto);
  }

  // GET /api/lives — public (sans authentification pour la page lives)
  @Get()
  async listerTousPublic() {
    return this.livesService.listerTous();
  }

  // GET /api/lives/:id
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.livesService.findById(id);
  }

  // PATCH /api/lives/:id/statut — ADMIN et FORMATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Patch(':id/statut')
  async mettreAJourStatut(
    @Param('id') id: string,
    @Body() dto: MettreAJourStatutDto,
  ) {
    return this.livesService.mettreAJourStatut(id, dto.statut, dto.replayUrl);
  }

  // DELETE /api/lives/:id — ADMIN et FORMATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Delete(':id')
  async supprimer(@Param('id') id: string) {
    return this.livesService.supprimer(id);
  }

  // POST /api/lives/:id/chat — tous sauf SPECTATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR', 'APPRENANT')
  @Post(':id/chat')
  async envoyerMessage(
    @Request() req: any,
    @Param('id') liveId: string,
    @Body() dto: EnvoyerMessageDto,
  ) {
    return this.livesService.envoyerMessageChat(req.user.id, liveId, dto.contenu);
  }
}