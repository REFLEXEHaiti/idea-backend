// src/lecons/lecons.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { LeconsService } from './lecons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lecons')
export class LeconsController {
  constructor(private readonly leconsService: LeconsService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.leconsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async creer(@Body() body: any) {
    return this.leconsService.creer(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async modifier(@Param('id') id: string, @Body() body: any) {
    return this.leconsService.modifier(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async supprimer(@Param('id') id: string) {
    return this.leconsService.supprimer(id);
  }

  @Post(':id/terminer')
  @UseGuards(JwtAuthGuard)
  async marquerTerminee(@Param('id') leconId: string, @Req() req: any) {
    return this.leconsService.marquerTerminee(req.user.id, leconId);
  }
}
