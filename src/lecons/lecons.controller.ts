import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { LeconsService } from './lecons.service';
import { CreerLeconDto } from './dto/creer-lecon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('lecons')
export class LeconsController {
  constructor(private readonly leconsService: LeconsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Body() dto: CreerLeconDto) {
    return this.leconsService.creer(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.leconsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/terminer')
  async marquerTerminee(@Request() req: any, @Param('id') leconId: string) {
    return this.leconsService.marquerTerminee(req.user.id, leconId);
  }
}