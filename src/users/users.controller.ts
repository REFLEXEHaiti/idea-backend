// src/users/users.controller.ts
import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async listerTous(@Req() req: any) {
    return this.usersService.listerParTenant(req.user.tenantId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async changerRole(@Param('id') id: string, @Body('role') role: string, @Req() req: any) {
    return this.usersService.changerRole(id, role, req.user.tenantId);
  }

  @Patch(':id/desactiver')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async desactiver(@Param('id') id: string, @Req() req: any) {
    return this.usersService.desactiver(id, req.user.tenantId);
  }
}
