import { Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /api/notifications — mes notifications
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMesNotifications(@Request() req: any) {
    return this.notificationsService.getMesNotifications(req.user.id);
  }

  // GET /api/notifications/non-lues — compter les non lues
  @UseGuards(JwtAuthGuard)
  @Get('non-lues')
  async compterNonLues(@Request() req: any) {
    return this.notificationsService.compterNonLues(req.user.id);
  }

  // PATCH /api/notifications/lire-tout — marquer tout comme lu
  @UseGuards(JwtAuthGuard)
  @Patch('lire-tout')
  async marquerToutesLues(@Request() req: any) {
    return this.notificationsService.marquerToutesLues(req.user.id);
  }
}