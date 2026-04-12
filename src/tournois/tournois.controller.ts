// src/tournois/tournois.controller.ts
import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TournoisService } from './tournois.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tournois')
export class TournoisController {
  constructor(private readonly tournoisService: TournoisService) {}

  @Get()
  async listerTous(@Req() req: any) {
    return this.tournoisService.listerTous(req['tenantId']);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.tournoisService.findById(id, req['tenantId']);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async creer(@Body() body: any, @Req() req: any) {
    return this.tournoisService.creer(req.user.id, req.user.tenantId, body);
  }

  @Post(':id/inscrire')
  @UseGuards(JwtAuthGuard)
  async inscrireEquipe(@Param('id') tournoiId: string, @Body() body: any, @Req() req: any) {
    return this.tournoisService.inscrireEquipe(req.user.id, req.user.tenantId, { ...body, tournoiId });
  }

  @Post(':id/calendrier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async genererCalendrier(@Param('id') tournoiId: string, @Req() req: any) {
    return this.tournoisService.genererCalendrier(tournoiId, req.user.tenantId);
  }

  @Post('matchs/:matchId/resultat')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async enregistrerResultat(
    @Param('matchId') matchId: string,
    @Body('scoreEquipe1') scoreEquipe1: number,
    @Body('scoreEquipe2') scoreEquipe2: number,
    @Req() req: any,
  ) {
    return this.tournoisService.enregistrerResultat(matchId, scoreEquipe1, scoreEquipe2, req.user.tenantId);
  }
}
