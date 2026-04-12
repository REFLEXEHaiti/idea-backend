// src/cours/cours.controller.ts
import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { CoursService } from './cours.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('cours')
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  @Get()
  async listerTous(@Req() req: any, @Query('niveau') niveau?: string, @Query('categorie') categorie?: string) {
    const tenantId = req['tenantId'] as string;
    return this.coursService.listerTous(tenantId, niveau, categorie);
  }

  @Get('admin/tous')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async listerTousAdmin(@Req() req: any) {
    return this.coursService.listerTousAdmin(req.user.tenantId);
  }

  @Get('mes-inscriptions')
  @UseGuards(JwtAuthGuard)
  async mesInscriptions(@Req() req: any) {
    return this.coursService.mesInscriptions(req.user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    const tenantId = req['tenantId'] as string;
    return this.coursService.findById(id, tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async creer(@Body() body: any, @Req() req: any) {
    return this.coursService.creer(req.user.id, req.user.tenantId, body);
  }

  @Patch(':id/publier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async togglePublier(@Param('id') id: string, @Req() req: any) {
    return this.coursService.togglePublier(id, req.user.id, req.user.role, req.user.tenantId);
  }

  @Post(':id/inscrire')
  @UseGuards(JwtAuthGuard)
  async sInscrire(@Param('id') coursId: string, @Req() req: any) {
    return this.coursService.sInscrire(req.user.id, coursId, req.user.tenantId);
  }

  @Get(':id/progression')
  @UseGuards(JwtAuthGuard)
  async getProgression(@Param('id') coursId: string, @Req() req: any) {
    return this.coursService.getProgression(req.user.id, coursId, req.user.tenantId);
  }
}
