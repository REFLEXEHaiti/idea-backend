import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { DebatsService } from './debats.service';
import { CreerDebatDto } from './dto/creer-debat.dto';
import { ModifierDebatDto } from './dto/modifier-debat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('debats')
export class DebatsController {
  constructor(private readonly debatsService: DebatsService) {}

  // POST /api/debats — FORMATEUR et ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Request() req: any, @Body() dto: CreerDebatDto) {
    return this.debatsService.creer(req.user.id, dto);
  }

  // GET /api/debats — accessible à tous les connectés
  @UseGuards(JwtAuthGuard)
  @Get()
  async listerTous(
    @Query('page') page: string = '1',
    @Query('limite') limite: string = '10',
  ) {
    return this.debatsService.listerTous(parseInt(page), parseInt(limite));
  }

  // GET /api/debats/:id — accessible à tous les connectés
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.debatsService.findById(id);
  }

  // PATCH /api/debats/:id — créateur ou ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Patch(':id')
  async modifier(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ModifierDebatDto,
  ) {
    return this.debatsService.modifier(id, req.user.id, req.user.role, dto);
  }

  // DELETE /api/debats/:id — ADMIN seulement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async supprimer(@Param('id') id: string) {
    return this.debatsService.supprimer(id);
  }
}