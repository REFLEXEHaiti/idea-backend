import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // GET /api/analytics/metriques — ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('metriques')
  async getMetriques() {
    return this.analyticsService.getMetriques();
  }

  // GET /api/analytics/top-debats — ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('top-debats')
  async getTopDebats() {
    return this.analyticsService.getTopDebats();
  }

  // GET /api/analytics/top-contributeurs — ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('top-contributeurs')
  async getTopContributeurs() {
    return this.analyticsService.getTopContributeurs();
  }
}