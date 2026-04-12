// src/analytics/analytics.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getMetriques(@Req() req: any) {
    return this.analyticsService.getMetriques(req.user.tenantId);
  }

  @Get('admin/top-cours')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getTopCours(@Req() req: any) {
    return this.analyticsService.getTopCours(req.user.tenantId);
  }

  @Get('admin/top-contributeurs')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getTopContributeurs(@Req() req: any) {
    return this.analyticsService.getTopContributeurs(req.user.tenantId);
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.analyticsService.getDashboardApprenant(req.user.id, req.user.tenantId);
  }
}
