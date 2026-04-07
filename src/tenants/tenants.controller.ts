import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async creer(@Body() body: any) {
    return this.tenantsService.creer(body);
  }

  @Get()
  async listerTous() {
    return this.tenantsService.listerTous();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async mettreAJour(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.mettreAJour(id, body);
  }
}
