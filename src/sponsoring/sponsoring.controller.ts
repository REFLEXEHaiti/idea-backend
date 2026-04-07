import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SponsoringService } from './sponsoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sponsoring')
export class SponsoringController {
  constructor(private readonly sponsoringService: SponsoringService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('sponsors')
  async creerSponsor(@Body() body: any) {
    return this.sponsoringService.creerSponsor(body);
  }

  @Get('sponsors')
  async getSponsorsActifs() {
    return this.sponsoringService.getSponsorsActifs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('sponsors/tous')
  async listerTous() {
    return this.sponsoringService.listerTous();
  }

  @Get('tournois/:tournoiId')
  async getSponsorsTournoi(@Param('tournoiId') tournoiId: string) {
    return this.sponsoringService.getSponsorsTournoi(tournoiId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('associer')
  async associer(@Body() body: { sponsorId: string; tournoiId: string }) {
    return this.sponsoringService.associerSponsorTournoi(body.sponsorId, body.tournoiId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('sponsors/:id')
  async modifierSponsor(@Param('id') id: string, @Body() body: any) {
    return this.sponsoringService.modifierSponsor(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('sponsors/:id')
  async supprimerSponsor(@Param('id') id: string) {
    return this.sponsoringService.supprimerSponsor(id);
  }
}
