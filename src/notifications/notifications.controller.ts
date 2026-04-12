// src/notifications/notifications.controller.ts
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMesNotifications(@Req() req: any) {
    return this.notificationsService.getMesNotifications(req.user.id);
  }

  @Get('non-lues')
  async compterNonLues(@Req() req: any) {
    return this.notificationsService.compterNonLues(req.user.id);
  }

  @Post('tout-lire')
  async marquerToutesLues(@Req() req: any) {
    return this.notificationsService.marquerToutesLues(req.user.id);
  }
}
