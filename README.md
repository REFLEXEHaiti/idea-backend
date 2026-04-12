# IDEA Haiti — Backend Multi-Tenant

> Un seul backend NestJS pour trois plateformes : **LexHaiti**, **TechPro Haiti**, **MediForm Haiti**

## Architecture

```
Frontend LexHaiti      (lexhaiti.com)       ──┐
Frontend TechPro Haiti (techprohaiti.com)   ──┼──► Backend IDEA (Railway) ──► PostgreSQL
Frontend MediForm Haiti(mediformhaiti.com)  ──┘
```

Le backend identifie le tenant via le header `X-Tenant-ID` sur chaque requête.  
Toutes les données sont isolées par `tenant_id` — aucun croisement possible.

---

## Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'environnement
```bash
cp .env.example .env
# Remplir DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, etc.
```

### 3. Appliquer la migration base de données
```bash
# Nouvelle base vide :
npx prisma migrate deploy

# OU migration depuis Debat Haiti existant :
# Exécuter le fichier SQL manuellement :
# prisma/migrations/20260411_idea_haiti_multitenant/migration.sql
```

### 4. Seed — créer les 3 tenants
```bash
npx ts-node prisma/seed.ts
```

### 5. Démarrer en développement
```bash
npm run start:dev
```

Le serveur démarre sur `http://localhost:3001/api`

---

## Utilisation du header tenant

**Chaque requête frontend doit inclure :**

```http
X-Tenant-ID: lex        ← LexHaiti
X-Tenant-ID: techpro    ← TechPro Haiti
X-Tenant-ID: mediform   ← MediForm Haiti
```

**En développement**, vous pouvez aussi utiliser le paramètre URL :
```
GET /api/cours?tenant=techpro
```

---

## Endpoints principaux

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/tenants/:slug/config` | GET | Config publique du tenant (couleurs, modules) |
| `/api/auth/inscription` | POST | Inscription (tenant isolé) |
| `/api/auth/connexion` | POST | Connexion |
| `/api/cours` | GET | Cours du tenant |
| `/api/lives` | GET | Lives du tenant |
| `/api/debats` | GET | Débats (LexHaiti) |
| `/api/tournois` | GET | Tournois (LexHaiti) |
| `/api/ia/chatbot` | POST | Chatbot IA adapté au tenant |
| `/api/ia/generer-quiz` | POST | Génération quiz IA |
| `/api/ia/analyser-argument` | POST | Analyse argument (LexHaiti only) |
| `/api/ia/simulation-clinique` | POST | Simulation clinique (MediForm only) |
| `/api/paiements/tarifs` | GET | Tarifs HTG du tenant |
| `/api/paiements/stripe/session` | POST | Session Stripe |
| `/api/paiements/moncash/initier` | POST | Paiement MonCash |
| `/api/analytics/dashboard` | GET | Dashboard apprenant |
| `/api/gamification/classement` | GET | Classement du tenant |

---

## Modules actifs par plateforme

| Module | LexHaiti | TechPro Haiti | MediForm Haiti |
|--------|----------|---------------|----------------|
| Cours & Leçons | ✅ | ✅ | ✅ |
| Lives | ✅ | ✅ | ✅ |
| Quiz & IA | ✅ | ✅ | ✅ |
| Chatbot (domaine adapté) | Droit haïtien | Pro/bancaire | Médical/infirmier |
| Analyse d'argument IA | ✅ | ❌ | ❌ |
| Simulation clinique IA | ❌ | ❌ | ✅ |
| Débats juridiques | ✅ | ❌ | ❌ |
| Tournois / Moot Courts | ✅ | ❌ | ❌ |
| Paiements (HTG) | 600/1000/1800 | 700/1200/1800 | 600/1000/1500 |
| Gamification | ✅ | ✅ | ✅ |

---

## Déploiement Railway

1. Créer un projet Railway et connecter le dépôt GitHub `idea-backend`
2. Ajouter les variables d'environnement (voir `.env.example`)
3. Railway déploie automatiquement à chaque push sur `main`
4. L'URL de l'API sera : `https://idea-backend.up.railway.app/api`

---

## Structure du projet

```
idea-backend/
├── prisma/
│   ├── schema.prisma          ← Schéma multi-tenant complet
│   ├── seed.ts                ← Crée les 3 tenants
│   └── migrations/
│       └── 20260411_idea_haiti_multitenant/
│           └── migration.sql  ← Migration depuis Debat Haiti
├── src/
│   ├── middleware/
│   │   └── tenant.middleware.ts  ← Lit X-Tenant-ID
│   ├── tenants/               ← Config par plateforme
│   ├── auth/                  ← JWT multi-tenant
│   ├── users/                 ← Utilisateurs isolés par tenant
│   ├── cours/ + lecons/ + quiz/
│   ├── lives/
│   ├── debats/ + messages/ + votes/  ← LexHaiti
│   ├── tournois/              ← LexHaiti
│   ├── ia/                    ← Chatbot + Quiz + Analyse + Simulation
│   ├── gamification/
│   ├── paiements/             ← Stripe + MonCash avec tarifs HTG
│   ├── sponsoring/
│   ├── notifications/
│   ├── analytics/             ← Dashboard admin + apprenant
│   ├── websocket/             ← Temps réel multi-tenant
│   ├── app.module.ts          ← Wiring middleware + modules
│   └── main.ts                ← CORS multi-domaine + bootstrap
└── .env.example
```
