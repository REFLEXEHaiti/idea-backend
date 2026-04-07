import {
  Controller, Post, Patch, Delete,
  Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreerMessageDto } from './dto/creer-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // POST /api/messages — APPRENANT, FORMATEUR, ADMIN (pas SPECTATEUR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR', 'APPRENANT')
  @Post()
  async creer(@Request() req: any, @Body() dto: CreerMessageDto) {
    return this.messagesService.creer(req.user.id, dto);
  }

  // PATCH /api/messages/:id/masquer — FORMATEUR, ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Patch(':id/masquer')
  async masquer(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.masquer(id, req.user.id, req.user.role);
  }

  // DELETE /api/messages/:id — auteur du message ou ADMIN
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async supprimer(@Param('id') id: string, @Request() req: any) {
    return this.messagesService.supprimer(id, req.user.id, req.user.role);
  }
}