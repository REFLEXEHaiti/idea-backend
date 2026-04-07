// src/config/configuration.ts
// CORRECTION : section smtp ajoutée pour que auth.service.ts
// puisse lire SMTP_USER et SMTP_PASS proprement via ConfigService
// sans jamais hardcoder de valeurs dans le code source.

export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  // NOUVEAU — credentials email lus depuis les variables d'environnement
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  moncash: {
    apiUrl: process.env.MONCASH_API_URL,
    clientId: process.env.MONCASH_CLIENT_ID,
    secretKey: process.env.MONCASH_SECRET_KEY,
  },

  frontend: {
    url: process.env.FRONTEND_URL,
  },
});
