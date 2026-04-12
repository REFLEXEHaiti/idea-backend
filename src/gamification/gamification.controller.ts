// src/gamification/gamification.controller.ts
import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('classement')
  async getClassement(@Req() req: any, @Query('limite') limite?: string) {
    return this.gamificationService.getClassement(req['tenantId'], parseInt(limite ?? '10'));
  }

  @Get('challenges')
  async getChallengesActifs(@Req() req: any) {
    return this.gamificationService.getChallengesActifs(req['tenantId']);
  }

  @Get('mes-stats')
  @UseGuards(JwtAuthGuard)
  async getMesStats(@Req() req: any) {
    return this.gamificationService.getStatsUtilisateur(req.user.id);
  }

  @Post('challenges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async creerChallenge(@Body() body: any, @Req() req: any) {
    return this.gamificationService.creerChallenge(req.user.tenantId, body);
  }
}
