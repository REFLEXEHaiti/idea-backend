// src/sponsoring/sponsoring.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SponsoringService } from './sponsoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sponsors')
export class SponsoringController {
  constructor(private readonly sponsoringService: SponsoringService) {}

  @Get()
  async getSponsorsActifs(@Req() req: any) {
    return this.sponsoringService.getSponsorsActifs(req['tenantId']);
  }

  @Get('admin/tous')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async listerTous(@Req() req: any) {
    return this.sponsoringService.listerTous(req.user.tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async creer(@Body() body: any, @Req() req: any) {
    return this.sponsoringService.creerSponsor(req.user.tenantId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async modifier(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.sponsoringService.modifierSponsor(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async supprimer(@Param('id') id: string, @Req() req: any) {
    return this.sponsoringService.supprimerSponsor(id, req.user.tenantId);
  }

  @Post(':id/associer-tournoi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async associerTournoi(@Param('id') sponsorId: string, @Body('tournoiId') tournoiId: string) {
    return this.sponsoringService.associerSponsorTournoi(sponsorId, tournoiId);
  }
}
