// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMesNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async marquerToutesLues(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, lue: false }, data: { lue: true } });
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  async compterNonLues(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, lue: false } });
    return { nonLues: count };
  }

  async creer(data: { userId: string; type: string; titre: string; contenu: string; lienId?: string }) {
    return this.prisma.notification.create({ data: data as any });
  }
}
