# 🚀 Guide de déploiement — Backend Débat Haïti

## ⚡ Démarrage rapide (local)

```bash
cd plateforme-debat-backend

# 1. Installer les dépendances (une seule fois)
npm install

# 2. Générer le client Prisma (une seule fois)
npx prisma generate

# 3. Démarrer en mode développement (hot-reload)
npm run start:dev
```

> ✅ Le serveur tourne sur http://localhost:3001

---

## 🏭 Build de production

```bash
# Builder (crée le dossier dist/)
npm run build

# Lancer en production
npm run start:prod
# ou directement :
node dist/main.js
```

---

## ❌ Erreur "Cannot find module dist/main" ?

**Cause :** vous avez lancé `node dist/main` sans avoir buildu.

**Solution :**
```bash
npm run build        # crée dist/main.js
npm run start:prod   # lance node dist/main.js
```

Ne jamais mélanger `start:dev` (watch, pas de dist/) et `node dist/main`.

---

## ⚙️ Variables d'environnement (.env)

Créez `.env` à la racine (copiez `.env.example`) :

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=votre_secret_min_32_caracteres
FRONTEND_URL=https://plateforme-debat-frontend.vercel.app
SMTP_USER=debathaiti87@gmail.com
SMTP_PASS=dhzcjghwcjsouaf
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONCASH_API_URL=https://moncashbutton.digicelgroup.com/Api
MONCASH_CLIENT_ID=...
MONCASH_SECRET_KEY=...
```

---

## 🚂 Railway (production)

Railway exécute automatiquement le Procfile :
```
web: npm run build && node dist/main.js
```
Ajoutez les variables d'env dans le dashboard Railway.
Railway fournit `DATABASE_URL` automatiquement avec PostgreSQL addon.
