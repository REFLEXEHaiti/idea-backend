// src/profils/profils.controller.ts
import { Controller, Get, Patch, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ProfilsService } from './profils.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profils')
@UseGuards(JwtAuthGuard)
export class ProfilsController {
  constructor(private readonly profilsService: ProfilsService) {}

  @Get('moi')
  async getMonProfil(@Req() req: any) {
    return this.profilsService.getProfil(req.user.id);
  }

  @Get(':id')
  async getProfil(@Param('id') id: string) {
    return this.profilsService.getProfil(id);
  }

  @Patch('moi')
  async modifierProfil(@Req() req: any, @Body() body: any) {
    return this.profilsService.modifierProfil(req.user.id, body);
  }

  @Post(':id/abonner')
  async sabonner(@Req() req: any, @Param('id') cibleId: string) {
    return this.profilsService.sabonner(req.user.id, cibleId);
  }

  @Get(':id/abonnes')
  async getAbonnes(@Param('id') id: string) {
    return this.profilsService.getAbonnes(id);
  }
}
