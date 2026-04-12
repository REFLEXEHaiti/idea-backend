// src/messages/messages.controller.ts
import { Controller, Post, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async creer(@Body() body: any, @Req() req: any) {
    return this.messagesService.creer(req.user.id, req.user.tenantId, body);
  }

  @Patch(':id/masquer')
  async masquer(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.masquer(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  async supprimer(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.supprimer(id, req.user.id, req.user.role);
  }
}
