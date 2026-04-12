// src/paiements/paiements.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// Tarifs HTG par plateforme et par plan (selon le document directeur)
const TARIFS: Record<string, Record<string, { htg: number; usd: number; label: string }>> = {
  lex: {
    PREMIUM:     { htg: 600,  usd: 499,  label: 'Plan Étudiant'    },
    AVANCE:      { htg: 1000, usd: 799,  label: 'Plan Avocat'      },
    INSTITUTION: { htg: 1800, usd: 1499, label: 'Plan Institution' },
  },
  techpro: {
    PREMIUM:     { htg: 700,  usd: 599,  label: 'Plan Professionnel' },
    AVANCE:      { htg: 1200, usd: 999,  label: 'Plan Senior'        },
    INSTITUTION: { htg: 1800, usd: 1499, label: "Plan Entreprise"    },
  },
  mediform: {
    PREMIUM:     { htg: 600,  usd: 499,  label: 'Plan Infirmier'   },
    AVANCE:      { htg: 1000, usd: 799,  label: 'Plan Supérieur'   },
    INSTITUTION: { htg: 1500, usd: 1299, label: 'Plan Clinique'    },
  },
};

@Injectable()
export class PaiementsService {
  private _stripe: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getStripe() {
    if (!this._stripe) {
      const key = this.configService.get<string>('stripe.secretKey') ?? '';
      if (key) {
        const StripeLib = require('stripe');
        this._stripe = new StripeLib(key, { apiVersion: '2024-06-20' });
      }
    }
    return this._stripe;
  }

  getTarifs(tenantSlug: string) {
    return TARIFS[tenantSlug] ?? TARIFS['lex'];
  }

  async creerSessionStripe(userId: string, plan: string, tenantSlug: string) {
    const tarifs = this.getTarifs(tenantSlug);
    const tarif = tarifs[plan];
    if (!tarif) throw new BadRequestException('Plan invalide');

    const frontendUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const tenantNom = { lex: 'LexHaiti', techpro: 'TechPro Haiti', mediform: 'MediForm Haiti' }[tenantSlug] ?? 'IDEA Haiti';

    const session = await this.getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tenantNom} — ${tarif.label}`,
            description: 'Abonnement mensuel plateforme de formation',
          },
          unit_amount: tarif.usd,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url:  `${frontendUrl}/premium?cancelled=true`,
      metadata: { userId, plan, tenantSlug },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhookStripe(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret') ?? '';
    let event: any;

    try {
      event = this.getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Signature webhook invalide');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { userId, plan } = session.metadata ?? {};
      if (userId && plan) await this.activerAbonnement(userId, plan, session.id);
    }

    return { received: true };
  }

  async activerAbonnement(userId: string, plan: string, stripeId: string) {
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + 1);

    await this.prisma.abonnement2.create({
      data: {
        userId, plan: plan as any, statut: 'ACTIF',
        dateFin, stripeId, montant: 0, devise: 'USD',
      },
    });

    await this.prisma.notification.create({
      data: {
        type: 'MENTION',
        titre: `Abonnement ${plan} activé !`,
        contenu: 'Votre abonnement premium est maintenant actif. Profitez de tous les avantages !',
        userId,
      },
    });
  }

  async initierPaiementMonCash(userId: string, montantHTG: number, plan: string, tenantSlug: string) {
    const moncashApiUrl    = this.configService.get<string>('moncash.apiUrl') ?? '';
    const moncashClientId  = this.configService.get<string>('moncash.clientId') ?? '';
    const moncashSecretKey = this.configService.get<string>('moncash.secretKey') ?? '';

    const tokenResponse = await fetch(`${moncashApiUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${moncashClientId}:${moncashSecretKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=read,write',
    });

    const { access_token } = (await tokenResponse.json()) as any;
    const orderId = `IDEA-${tenantSlug.toUpperCase()}-${userId.slice(0, 8)}-${Date.now()}`;

    const paiementResponse = await fetch(`${moncashApiUrl}/v1/CreatePayment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: montantHTG, orderId }),
    });

    const paiement = (await paiementResponse.json()) as any;
    return {
      paymentToken: paiement.payment_token?.token,
      redirectUrl: `https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=${paiement.payment_token?.token}`,
      orderId,
    };
  }

  async verifierPaiementMonCash(orderId: string) {
    const moncashApiUrl    = this.configService.get<string>('moncash.apiUrl') ?? '';
    const moncashClientId  = this.configService.get<string>('moncash.clientId') ?? '';
    const moncashSecretKey = this.configService.get<string>('moncash.secretKey') ?? '';

    const tokenResponse = await fetch(`${moncashApiUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${moncashClientId}:${moncashSecretKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=read,write',
    });
    const { access_token } = (await tokenResponse.json()) as any;

    const response = await fetch(`${moncashApiUrl}/v1/RetrieveOrderPayment?orderId=${orderId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    return response.json();
  }

  async validerPaiementManuellement(userId: string, plan: string, reference: string, methode = 'MANUEL') {
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + 3);

    const abonnement = await this.prisma.abonnement2.create({
      data: {
        userId, plan: plan as any, statut: 'ACTIF',
        dateFin, stripeId: `${methode}-${reference}`,
        montant: 0, devise: 'HTG',
      },
    });

    await this.prisma.notification.create({
      data: {
        type: 'MENTION',
        titre: `Paiement validé — Plan ${plan}`,
        contenu: `Votre paiement ${methode} (réf: ${reference}) a été validé. Accès actif jusqu'au ${dateFin.toLocaleDateString('fr-FR')}.`,
        userId,
      },
    });

    return { message: 'Abonnement activé avec succès', abonnement };
  }

  async revoquerAbonnement(userId: string) {
    await this.prisma.abonnement2.updateMany({
      where: { userId, statut: 'ACTIF' },
      data: { statut: 'ANNULE' },
    });
    await this.prisma.notification.create({
      data: {
        type: 'MENTION',
        titre: 'Abonnement annulé',
        contenu: "Votre abonnement premium a été annulé. Contactez le support pour plus d'informations.",
        userId,
      },
    });
    return { message: 'Abonnement révoqué' };
  }

  async estPremium(userId: string): Promise<boolean> {
    const abonnement = await this.prisma.abonnement2.findFirst({
      where: { userId, statut: 'ACTIF', dateFin: { gte: new Date() } },
    });
    return !!abonnement;
  }

  async listerAbonnements(tenantId: string) {
    return this.prisma.abonnement2.findMany({
      where: { user: { tenantId } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, prenom: true, nom: true, email: true, role: true } },
      },
    });
  }

  async monAbonnement(userId: string) {
    return this.prisma.abonnement2.findFirst({
      where: { userId, statut: 'ACTIF', dateFin: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
