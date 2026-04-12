// src/lives/lives.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { LivesService } from './lives.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lives')
export class LivesController {
  constructor(private readonly livesService: LivesService) {}

  @Get()
  async listerTous(@Req() req: any) {
    return this.livesService.listerTous(req['tenantId']);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.livesService.findById(id, req['tenantId']);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async creer(@Body() body: any, @Req() req: any) {
    return this.livesService.creer(req.user.id, req.user.tenantId, body);
  }

  @Patch(':id/statut')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async mettreAJourStatut(
    @Param('id') id: string,
    @Body('statut') statut: string,
    @Body('replayUrl') replayUrl?: string,
  ) {
    return this.livesService.mettreAJourStatut(id, statut, replayUrl);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async envoyerMessage(@Param('id') liveId: string, @Body('contenu') contenu: string, @Req() req: any) {
    return this.livesService.envoyerMessageChat(req.user.id, liveId, contenu);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async supprimer(@Param('id') id: string) {
    return this.livesService.supprimer(id);
  }
}
