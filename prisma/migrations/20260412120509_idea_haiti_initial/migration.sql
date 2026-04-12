-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FORMATEUR', 'APPRENANT', 'SPECTATEUR');

-- CreateEnum
CREATE TYPE "StatutDebat" AS ENUM ('BROUILLON', 'OUVERT', 'FERME', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "TypeVote" AS ENUM ('POUR', 'CONTRE');

-- CreateEnum
CREATE TYPE "StanceMsg" AS ENUM ('POUR', 'CONTRE', 'NEUTRE');

-- CreateEnum
CREATE TYPE "TypeVoteDebat" AS ENUM ('POUR', 'CONTRE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('NOUVEAU_DEBAT', 'NOUVEAU_MESSAGE', 'NOUVEAU_VOTE', 'NOUVEL_ABONNE', 'MENTION', 'NOUVEAU_COURS', 'NOUVEAU_LIVE', 'BADGE_OBTENU');

-- CreateEnum
CREATE TYPE "NiveauCours" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('EN_COURS', 'TERMINE', 'ABANDONNE');

-- CreateEnum
CREATE TYPE "StatutLive" AS ENUM ('PROGRAMME', 'EN_DIRECT', 'TERMINE');

-- CreateEnum
CREATE TYPE "TypeBadge" AS ENUM ('PREMIER_DEBAT', 'RHETEUR_ARGENTE', 'RHETEUR_OR', 'FORMATEUR_ETOILE', 'CHAMPION', 'CONTRIBUTEUR', 'VOTEUR_ACTIF', 'PREMIER_COURS', 'ASSIDU', 'EXPERT');

-- CreateEnum
CREATE TYPE "StatutTournoi" AS ENUM ('INSCRIPTION', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutMatch" AS ENUM ('PROGRAMME', 'EN_DIRECT', 'TERMINE');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'EXPIRE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypePlan" AS ENUM ('GRATUIT', 'PREMIUM', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('PLATINE', 'OR', 'ARGENT', 'BRONZE');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "pays" TEXT NOT NULL DEFAULT 'HT',
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "domaine_web" TEXT,
    "couleurs_theme_json" JSONB,
    "modules_actifs_json" JSONB,
    "plateforme" TEXT NOT NULL DEFAULT 'idea',
    "email_contact" TEXT,
    "slogan_court" TEXT,
    "partenaires_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'APPRENANT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "photo_url" TEXT,
    "ville" TEXT,
    "whatsapp" TEXT,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resetToken" TEXT,
    "resetTokenExpire" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "niveau" "NiveauCours" NOT NULL DEFAULT 'DEBUTANT',
    "image_url" TEXT,
    "publie" BOOLEAN NOT NULL DEFAULT false,
    "categorie" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "createur_id" TEXT NOT NULL,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecons" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "duree_min" INTEGER NOT NULL DEFAULT 10,
    "pdf_url" TEXT,
    "video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cours_id" TEXT NOT NULL,

    CONSTRAINT "lecons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz" (
    "id" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lecon_id" TEXT NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_quiz" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reponses" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quiz_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "resultats_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'EN_COURS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "cours_id" TEXT NOT NULL,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progressions_lecons" (
    "id" TEXT NOT NULL,
    "termine" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "lecon_id" TEXT NOT NULL,

    CONSTRAINT "progressions_lecons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lives" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutLive" NOT NULL DEFAULT 'PROGRAMME',
    "date_debut" TIMESTAMP(3) NOT NULL,
    "youtube_url" TEXT,
    "replay_url" TEXT,
    "miniature_url" TEXT,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "createur_id" TEXT NOT NULL,

    CONSTRAINT "lives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages_live" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auteur_id" TEXT NOT NULL,
    "live_id" TEXT NOT NULL,

    CONSTRAINT "messages_live_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debats" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutDebat" NOT NULL DEFAULT 'BROUILLON',
    "categorie" TEXT,
    "date_debut" TIMESTAMP(3),
    "vues" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "createur_id" TEXT NOT NULL,

    CONSTRAINT "debats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "stance" "StanceMsg" NOT NULL DEFAULT 'NEUTRE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "auteur_id" TEXT NOT NULL,
    "debat_id" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "type" "TypeVote" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "votant_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes_debats" (
    "id" TEXT NOT NULL,
    "type" "TypeVoteDebat" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "votant_id" TEXT NOT NULL,
    "debat_id" TEXT NOT NULL,

    CONSTRAINT "votes_debats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournois" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" "StatutTournoi" NOT NULL DEFAULT 'INSCRIPTION',
    "max_equipes" INTEGER NOT NULL DEFAULT 8,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "prix_inscription" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "createur_id" TEXT NOT NULL,

    CONSTRAINT "tournois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tournoi_id" TEXT NOT NULL,
    "capitaine_id" TEXT NOT NULL,

    CONSTRAINT "equipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membres_equipes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipe_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "membres_equipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchs" (
    "id" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "statut" "StatutMatch" NOT NULL DEFAULT 'PROGRAMME',
    "date_match" TIMESTAMP(3) NOT NULL,
    "score_equipe1" INTEGER NOT NULL DEFAULT 0,
    "score_equipe2" INTEGER NOT NULL DEFAULT 0,
    "gagnant_id" TEXT,
    "youtube_url" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tournoi_id" TEXT NOT NULL,
    "equipe1_id" TEXT NOT NULL,
    "equipe2_id" TEXT NOT NULL,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_utilisateurs" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "niveau" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "points_utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "type" "TypeBadge" NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points_recompense" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participations_challenges" (
    "id" TEXT NOT NULL,
    "termine" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,

    CONSTRAINT "participations_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "lien_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "abonne_id" TEXT NOT NULL,
    "cible_id" TEXT NOT NULL,

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements2" (
    "id" TEXT NOT NULL,
    "plan" "TypePlan" NOT NULL DEFAULT 'GRATUIT',
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'ACTIF',
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "stripe_id" TEXT,
    "montant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'HTG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "abonnements2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "site_web" TEXT,
    "description" TEXT,
    "type_contrat" "TypeContrat" NOT NULL DEFAULT 'BRONZE',
    "montant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors_tournois" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sponsor_id" TEXT NOT NULL,
    "tournoi_id" TEXT NOT NULL,

    CONSTRAINT "sponsors_tournois_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_lecon_id_key" ON "quiz"("lecon_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_user_id_cours_id_key" ON "inscriptions"("user_id", "cours_id");

-- CreateIndex
CREATE UNIQUE INDEX "progressions_lecons_user_id_lecon_id_key" ON "progressions_lecons"("user_id", "lecon_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_votant_id_message_id_key" ON "votes"("votant_id", "message_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_debats_votant_id_debat_id_key" ON "votes_debats"("votant_id", "debat_id");

-- CreateIndex
CREATE UNIQUE INDEX "membres_equipes_equipe_id_user_id_key" ON "membres_equipes"("equipe_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "points_utilisateurs_user_id_key" ON "points_utilisateurs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "participations_challenges_user_id_challenge_id_key" ON "participations_challenges"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "abonnements_abonne_id_cible_id_key" ON "abonnements"("abonne_id", "cible_id");

-- CreateIndex
CREATE UNIQUE INDEX "sponsors_tournois_sponsor_id_tournoi_id_key" ON "sponsors_tournois"("sponsor_id", "tournoi_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecons" ADD CONSTRAINT "lecons_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_lecon_id_fkey" FOREIGN KEY ("lecon_id") REFERENCES "lecons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_quiz" ADD CONSTRAINT "resultats_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_quiz" ADD CONSTRAINT "resultats_quiz_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressions_lecons" ADD CONSTRAINT "progressions_lecons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressions_lecons" ADD CONSTRAINT "progressions_lecons_lecon_id_fkey" FOREIGN KEY ("lecon_id") REFERENCES "lecons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_live" ADD CONSTRAINT "messages_live_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages_live" ADD CONSTRAINT "messages_live_live_id_fkey" FOREIGN KEY ("live_id") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debats" ADD CONSTRAINT "debats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debats" ADD CONSTRAINT "debats_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_auteur_id_fkey" FOREIGN KEY ("auteur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_debat_id_fkey" FOREIGN KEY ("debat_id") REFERENCES "debats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_votant_id_fkey" FOREIGN KEY ("votant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes_debats" ADD CONSTRAINT "votes_debats_votant_id_fkey" FOREIGN KEY ("votant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes_debats" ADD CONSTRAINT "votes_debats_debat_id_fkey" FOREIGN KEY ("debat_id") REFERENCES "debats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournois" ADD CONSTRAINT "tournois_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournois" ADD CONSTRAINT "tournois_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_tournoi_id_fkey" FOREIGN KEY ("tournoi_id") REFERENCES "tournois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_capitaine_id_fkey" FOREIGN KEY ("capitaine_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_equipes" ADD CONSTRAINT "membres_equipes_equipe_id_fkey" FOREIGN KEY ("equipe_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres_equipes" ADD CONSTRAINT "membres_equipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_tournoi_id_fkey" FOREIGN KEY ("tournoi_id") REFERENCES "tournois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_equipe1_id_fkey" FOREIGN KEY ("equipe1_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_equipe2_id_fkey" FOREIGN KEY ("equipe2_id") REFERENCES "equipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_utilisateurs" ADD CONSTRAINT "points_utilisateurs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations_challenges" ADD CONSTRAINT "participations_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations_challenges" ADD CONSTRAINT "participations_challenges_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_abonne_id_fkey" FOREIGN KEY ("abonne_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_cible_id_fkey" FOREIGN KEY ("cible_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements2" ADD CONSTRAINT "abonnements2_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors_tournois" ADD CONSTRAINT "sponsors_tournois_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors_tournois" ADD CONSTRAINT "sponsors_tournois_tournoi_id_fkey" FOREIGN KEY ("tournoi_id") REFERENCES "tournois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
