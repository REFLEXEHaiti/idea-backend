import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { CoursService } from './cours.service';
import { CreerCoursDto } from './dto/creer-cours.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('cours')
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  // POST /api/cours — FORMATEUR et ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Request() req: any, @Body() dto: CreerCoursDto) {
    return this.coursService.creer(req.user.id, dto);
  }

  // GET /api/cours — tous les apprenants
  @UseGuards(JwtAuthGuard)
  @Get()
  async listerTous(@Query('niveau') niveau?: string) {
    return this.coursService.listerTous(niveau);
  }

  // GET /api/cours/:id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.coursService.findById(id);
  }

  // POST /api/cours/:id/inscrire
  @UseGuards(JwtAuthGuard)
  @Post(':id/inscrire')
  async sInscrire(@Request() req: any, @Param('id') coursId: string) {
    return this.coursService.sInscrire(req.user.id, coursId);
  }

  // GET /api/cours/:id/progression
  @UseGuards(JwtAuthGuard)
  @Get(':id/progression')
  async getProgression(@Request() req: any, @Param('id') coursId: string) {
    return this.coursService.getProgression(req.user.id, coursId);
  }

  // PATCH /api/cours/:id/publier
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Patch(':id/publier')
  async togglePublier(@Param('id') id: string, @Request() req: any) {
    return this.coursService.togglePublier(id, req.user.id, req.user.role);
  }
}