// src/debats/debats.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { DebatsService } from './debats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('debats')
export class DebatsController {
  constructor(private readonly debatsService: DebatsService) {}

  @Get()
  async listerTous(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limite') limite?: string,
  ) {
    return this.debatsService.listerTous(
      req['tenantId'], parseInt(page ?? '1'), parseInt(limite ?? '10'),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.debatsService.findById(id, req['tenantId']);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async creer(@Body() body: any, @Req() req: any) {
    return this.debatsService.creer(req.user.id, req.user.tenantId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async modifier(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.debatsService.modifier(id, req.user.id, req.user.role, req.user.tenantId, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async supprimer(@Param('id') id: string, @Req() req: any) {
    return this.debatsService.supprimer(id, req.user.tenantId);
  }
}
