import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private prisma = new PrismaClient();

  // Récupérer toutes les notifications d'un utilisateur
  async getMesNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // dernières 50 notifications
    });
  }

  // Marquer toutes les notifications comme lues
  async marquerToutesLues(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, lue: false },
      data: { lue: true },
    });
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  // Compter les notifications non lues
  async compterNonLues(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, lue: false },
    });
    return { nonLues: count };
  }

  // Créer une notification (appelé depuis d'autres services)
  async creer(data: {
    userId: string;
    type: string;
    titre: string;
    contenu: string;
    lienId?: string;
  }) {
    return this.prisma.notification.create({ data: data as any });
  }
}