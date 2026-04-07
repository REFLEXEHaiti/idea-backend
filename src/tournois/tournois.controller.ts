import { Controller, Get, Post, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { TournoisService } from './tournois.service';
import { CreerTournoiDto } from './dto/creer-tournoi.dto';
import { CreerEquipeDto } from './dto/creer-equipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNumber } from 'class-validator';

class ResultatMatchDto {
  @IsNumber()
  scoreEquipe1: number;
  @IsNumber()
  scoreEquipe2: number;
}

@Controller('tournois')
export class TournoisController {
  constructor(private readonly tournoisService: TournoisService) {}

  // POST /api/tournois — ADMIN et FORMATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Request() req: any, @Body() dto: CreerTournoiDto) {
    return this.tournoisService.creer(req.user.id, dto);
  }

  // GET /api/tournois
  @UseGuards(JwtAuthGuard)
  @Get()
  async listerTous() {
    return this.tournoisService.listerTous();
  }

  // GET /api/tournois/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tournoisService.findById(id);
  }

  // POST /api/tournois/inscrire — tous les connectés
  @UseGuards(JwtAuthGuard)
  @Post('inscrire')
  async inscrireEquipe(@Request() req: any, @Body() dto: CreerEquipeDto) {
    return this.tournoisService.inscrireEquipe(req.user.id, dto);
  }

  // POST /api/tournois/:id/generer-calendrier — ADMIN et FORMATEUR
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post(':id/generer-calendrier')
  async genererCalendrier(@Param('id') id: string) {
    return this.tournoisService.genererCalendrier(id);
  }

  // POST /api/tournois/tirer-sujet — ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post('tirer-sujet')
  async tirerSujet() {
    const sujet = await this.tournoisService.tirerSujetIA();
    return { sujet };
  }

  // PATCH /api/tournois/matchs/:id/resultat — ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('matchs/:id/resultat')
  async enregistrerResultat(
    @Param('id') matchId: string,
    @Body() dto: ResultatMatchDto,
  ) {
    return this.tournoisService.enregistrerResultat(
      matchId,
      dto.scoreEquipe1,
      dto.scoreEquipe2,
    );
  }
}