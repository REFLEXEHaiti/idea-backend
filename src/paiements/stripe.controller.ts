import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

// Ne pas instancier Stripe au niveau module — la clé n'est pas encore chargée
// On crée l'instance uniquement au moment de l'appel

@Controller('paiements')
export class StripeController {

  private getStripe() {
    const Stripe = require('stripe');
    const key = process.env.STRIPE_SECRET_KEY || '';
    if (!key) return null;
    return new Stripe(key, { apiVersion: '2023-10-16' });
  }

  @HttpCode(HttpStatus.OK)
  @Post('stripe/session')
  async creerSession(@Body() body: { montant: number; description: string }) {
    const stripe = this.getStripe();
    if (!stripe) {
      return { error: 'Stripe non configuré — ajoutez STRIPE_SECRET_KEY dans les variables d\'environnement' };
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: body.description, description: 'Plateforme Débat Haïti' },
          unit_amount: body.montant * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: (process.env.FRONTEND_URL || 'https://plateforme-debat-frontend.vercel.app') + '/paiement/succes?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: (process.env.FRONTEND_URL || 'https://plateforme-debat-frontend.vercel.app') + '/paiement/annule',
    });
    return { url: session.url };
  }

  @HttpCode(HttpStatus.OK)
  @Post('stripe/verifier')
  async verifier(@Body() body: { sessionId: string }) {
    const stripe = this.getStripe();
    if (!stripe) return { paye: false };
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    return {
      paye: session.payment_status === 'paid',
      montant: (session.amount_total || 0) / 100,
      email: session.customer_details?.email,
    };
  }
}
