import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // GET /api/gamification/classement
  @UseGuards(JwtAuthGuard)
  @Get('classement')
  async getClassement(@Query('limite') limite: string = '10') {
    return this.gamificationService.getClassement(parseInt(limite));
  }

  // GET /api/gamification/mes-stats
  @UseGuards(JwtAuthGuard)
  @Get('mes-stats')
  async getMesStats(@Request() req: any) {
    return this.gamificationService.getStatsUtilisateur(req.user.id);
  }

  // GET /api/gamification/challenges
  @UseGuards(JwtAuthGuard)
  @Get('challenges')
  async getChallenges() {
    return this.gamificationService.getChallengesActifs();
  }

  // POST /api/gamification/challenges — ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('challenges')
  async creerChallenge(@Body() dto: any) {
    return this.gamificationService.creerChallenge(dto);
  }

  // POST /api/gamification/verifier-badges
  @UseGuards(JwtAuthGuard)
  @Post('verifier-badges')
  async verifierBadges(@Request() req: any) {
    return this.gamificationService.verifierBadges(req.user.id);
  }
}