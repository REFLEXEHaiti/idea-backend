export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
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

  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
