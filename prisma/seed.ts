// prisma/seed.ts
// Seed initial : crée les 3 tenants IDEA Haiti

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IDEA Haiti tenants...');

  // LexHaiti
  await prisma.tenant.upsert({
    where: { slug: 'lex' },
    update: {},
    create: {
      nom: 'LexHaiti',
      slug: 'lex',
      description: 'Plateforme de droit, avocature et débat juridique pour Haïti',
      domaineWeb: 'lexhaiti.com',
      sloganCourt: 'Droit & Avocature',
      emailContact: 'contact@lexhaiti.com',
      couleursThemeJson: {
        primaire: '#8B0000',
        secondaire: '#D4AF37',
        accent: '#F5F0E8',
        texte: '#1A1A1A',
      },
      modulesActifsJson: {
        debats: true,
        tournois: true,
        simulations: true,
        cours: true,
        lives: true,
        gamification: true,
        paiements: true,
        ia: true,
        bibliotheque: true,
      },
      partenairesJson: [
        { nom: 'Barreau de Port-au-Prince', logoUrl: null },
        { nom: 'Facultés de Droit dHaïti', logoUrl: null },
      ],
      pays: 'HT',
      langue: 'fr',
    },
  });

  // TechPro Haiti
  await prisma.tenant.upsert({
    where: { slug: 'techpro' },
    update: {},
    create: {
      nom: 'TechPro Haiti',
      slug: 'techpro',
      description: 'Formations techniques et professionnelles pour Haïti',
      domaineWeb: 'techprohaiti.com',
      sloganCourt: 'Formations Pro',
      emailContact: 'contact@techprohaiti.com',
      couleursThemeJson: {
        primaire: '#1B3A6B',
        secondaire: '#FF6B35',
        accent: '#EBF3FB',
        texte: '#0D1B2A',
      },
      modulesActifsJson: {
        debats: false,
        tournois: false,
        simulations: true,
        cours: true,
        lives: true,
        gamification: true,
        paiements: true,
        ia: true,
        bibliotheque: true,
      },
      partenairesJson: [
        { nom: 'BRH - Banque de la République dHaïti', logoUrl: null },
        { nom: 'Chambre de Commerce et dIndustrie dHaïti', logoUrl: null },
      ],
      pays: 'HT',
      langue: 'fr',
    },
  });

  // MediForm Haiti
  await prisma.tenant.upsert({
    where: { slug: 'mediform' },
    update: {},
    create: {
      nom: 'MediForm Haiti',
      slug: 'mediform',
      description: 'Formation médicale et paramédicale pour les professionnels de santé haïtiens',
      domaineWeb: 'mediformhaiti.com',
      sloganCourt: 'Santé & Paramédicale',
      emailContact: 'contact@mediformhaiti.com',
      couleursThemeJson: {
        primaire: '#1B6B45',
        secondaire: '#1E5FA8',
        accent: '#E8F5ED',
        texte: '#0D2818',
      },
      modulesActifsJson: {
        debats: false,
        tournois: false,
        simulations: true,
        cours: true,
        lives: true,
        gamification: true,
        paiements: true,
        ia: true,
        bibliotheque: true,
      },
      partenairesJson: [
        { nom: 'MSPP - Ministère de la Santé Publique', logoUrl: null },
        { nom: "Ordre des Infirmiers et Infirmières d'Haïti", logoUrl: null },
      ],
      pays: 'HT',
      langue: 'fr',
    },
  });

  console.log('Tenants créés : lex, techpro, mediform');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
