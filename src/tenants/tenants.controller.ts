// src/tenants/tenants.controller.ts
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Config publique — utilisée par le frontend au démarrage
  @Get(':slug/config')
  async configPublique(@Param('slug') slug: string) {
    return this.tenantsService.configPublique(slug);
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
  @Post()
  async creer(@Body() body: any) {
    return this.tenantsService.creer(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async mettreAJour(@Param('id') id: string, @Body() body: any) {
    return this.tenantsService.mettreAJour(id, body);
  }
}
