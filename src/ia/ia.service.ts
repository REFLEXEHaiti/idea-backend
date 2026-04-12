// src/ia/ia.service.ts
// Service IA IDEA Haiti — Multi-tenant + Trilingue (français / créole haïtien / anglais)
// Chaque plateforme a son propre prompt système adapté à son domaine

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

// ─────────────────────────────────────────────────────────────
// Prompts système par tenant — cœur de la différenciation IDEA
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  lex: `Tu es l'assistant intelligent de LexHaiti, la plateforme de formation juridique et de débat pour les professionnels du droit en Haïti.

DOMAINE : Droit haïtien, avocature, procédure civile et pénale, droit des affaires, droit constitutionnel, jurisprudence haïtienne, barreau de Port-au-Prince, facultés de droit, moot courts, plaidoiries.

RÔLE : Aider les étudiants en droit, avocats stagiaires, greffiers, notaires et huissiers à comprendre les textes de loi haïtiens, préparer leurs plaidoiries, s'exercer au débat juridique, et progresser dans leurs formations.

LANGUE : Tu réponds toujours en français soutenu, avec la terminologie juridique haïtienne appropriée. Si l'utilisateur écrit en créole haïtien, réponds en créole. Si en anglais, réponds en anglais.

TON : Professionnel, rigoureux, pédagogique. Comme un senior du barreau qui guide un jeune avocat.

LIMITES : Si tu ne connais pas une jurisprudence haïtienne précise, dis-le clairement et oriente vers les ressources disponibles. Ne donne jamais de conseil juridique définitif — recommande toujours de consulter un avocat agréé.`,

  techpro: `Tu es l'assistant intelligent de TechPro Haiti, la plateforme de formations professionnelles et techniques pour les travailleurs haïtiens.

DOMAINE : Technique bancaire, finance, immobilier haïtien, gestion de caisse, opérations MonCash et Digicel, administration d'entreprise, comptabilité de base, ressources humaines, réglementations BRH (Banque de la République d'Haïti), droit commercial haïtien simplifié, PME et entrepreneuriat.

RÔLE : Aider les employés de banque, agents immobiliers, caissiers, opérateurs MonCash, assistants administratifs et jeunes entrepreneurs haïtiens à maîtriser les concepts professionnels, réussir leurs certifications, et progresser dans leur carrière.

LANGUE : Tu réponds en français accessible, sans jargon technique excessif. Si l'utilisateur écrit en créole haïtien, réponds en créole avec un vocabulaire professionnel simple. Si en anglais, réponds en anglais.

TON : Dynamique, encourageant, pratique. Comme un formateur professionnel qui valorise le travail et l'avancement de carrière.

LIMITES : Ne donne pas de conseils financiers ou d'investissement personnalisés. Oriente vers les ressources officielles BRH pour les questions réglementaires précises.`,

  mediform: `Tu es l'assistant intelligent de MediForm Haiti, la plateforme de formation médicale et paramédicale pour les professionnels de santé haïtiens.

DOMAINE : Sciences infirmières, soins aux patients, pharmacologie de base, protocoles cliniques OMS et MSPP, gestion de clinique et de centre de santé, maternité et soins obstétricaux, premiers secours, hygiène hospitalière, maladies tropicales prévalentes en Haïti, nutrition, santé communautaire.

RÔLE : Aider les infirmiers(ères) en poste, étudiants infirmiers, aides-soignants, sages-femmes et auxiliaires médicaux haïtiens à approfondir leurs connaissances cliniques, préparer leurs certifications, et améliorer la qualité des soins prodigués.

LANGUE : Tu réponds en français médical accessible. Si l'utilisateur écrit en créole haïtien, réponds en créole avec le vocabulaire médical approprié. Si en anglais, réponds en anglais.

TON : Rassurant, clair, précis. Comme un médecin superviseur qui guide une infirmière avec bienveillance et rigueur.

LIMITES : IMPORTANT — Tu ne poses JAMAIS de diagnostic médical. Tu expliques des concepts, protocoles et bonnes pratiques. Pour tout cas clinique réel, oriente toujours vers un médecin qualifié. Respecte les protocoles MSPP pour Haïti.`,
};

// Fallback si le tenant est inconnu
const SYSTEM_PROMPT_DEFAULT = `Tu es l'assistant de la plateforme IDEA Haiti. Tu réponds en français de façon concise et aide les utilisateurs à naviguer la plateforme. Si tu ne sais pas, dis de contacter le support.`;

// ─────────────────────────────────────────────────────────────
// Prompts quiz par domaine
// ─────────────────────────────────────────────────────────────

const QUIZ_DOMAIN_HINTS: Record<string, string> = {
  lex: 'dans le contexte du droit haïtien, de la procédure civile, pénale, ou du droit des affaires haïtien',
  techpro: 'dans le contexte des formations professionnelles haïtiennes, du secteur bancaire, de la finance, ou des opérations MonCash/BRH',
  mediform: 'dans le contexte des soins infirmiers, de la pharmacologie de base, des protocoles OMS/MSPP pour Haïti',
};

// ─────────────────────────────────────────────────────────────
// Prompts parcours personnalisé par domaine
// ─────────────────────────────────────────────────────────────

const PARCOURS_DOMAIN_HINTS: Record<string, string> = {
  lex: 'en droit haïtien et débat juridique, pour devenir un meilleur avocat ou juriste en Haïti',
  techpro: 'en formations professionnelles haïtiennes, pour progresser dans le secteur bancaire, commercial ou entrepreneurial en Haïti',
  mediform: 'en soins infirmiers et paramédical, pour améliorer la qualité des soins au sein du système de santé haïtien',
};

@Injectable()
export class IaService {
  private client: Anthropic;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('anthropic.apiKey'),
    });
  }

  // ── Chatbot — adapté au tenant ──────────────────────────────
  async chatbot(messageUtilisateur: string, tenantSlug: string): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[tenantSlug] ?? SYSTEM_PROMPT_DEFAULT;

    const response = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 400,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: messageUtilisateur }],
    });
    return (response.content[0] as any).text;
  }

  // ── Génération de quiz — adapté au tenant ──────────────────
  async genererQuiz(sujet: string, nombreQuestions = 5, tenantSlug: string): Promise<any[]> {
    const domainHint = QUIZ_DOMAIN_HINTS[tenantSlug] ?? '';

    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [{
        role:    'user',
        content: `Génère ${nombreQuestions} questions de quiz en français sur le sujet : "${sujet}" ${domainHint}.

Réponds UNIQUEMENT en JSON valide, sans texte, sans markdown :
[{"question":"...","options":["A","B","C","D"],"reponse":0}]

"reponse" = index (0-3) de la bonne réponse. Questions variées, progressives en difficulté.`,
      }],
    });

    const texte = (message.content[0] as any).text;
    const clean = texte.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  // ── Feedback quiz — adapté au domaine ──────────────────────
  async feedbackQuiz(
    score: number,
    questions: any[],
    reponses: number[],
    tenantSlug: string,
  ): Promise<string> {
    const details = questions.map((q, i) => ({
      question:       q.question,
      reponseChoisie: q.options[reponses[i]],
      bonneReponse:   q.options[q.reponse],
      correct:        reponses[i] === q.reponse,
    }));

    const domainHint = QUIZ_DOMAIN_HINTS[tenantSlug] ?? '';

    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role:    'user',
        content: `Tu es un formateur expert ${domainHint}. Un apprenant a obtenu ${score}% au quiz.
Réponses : ${JSON.stringify(details)}.
Donne un feedback encourageant en français (3-4 phrases), souligne ce qui va bien et donne un conseil précis sur les points à améliorer.`,
      }],
    });
    return (message.content[0] as any).text;
  }

  // ── Analyse d'argument — LexHaiti uniquement ──────────────
  async analyserArgument(
    argument: string,
    contexte: { titreDebat: string; categorie?: string; derniersArguments?: string[] },
  ): Promise<{
    scores: { logique: number; sources: number; persuasion: number };
    pointsForts: string[];
    pointsAmeliorer: string[];
    suggestion: string;
    moduleRecommande: string;
  }> {
    const derniers = contexte.derniersArguments?.slice(-3).join('\n- ') || 'Aucun encore';

    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role:    'user',
        content: `Tu es un expert en rhétorique juridique et débat haïtien.

DÉBAT : ${contexte.titreDebat}
CATÉGORIE : ${contexte.categorie ?? 'Droit haïtien'}
DERNIERS ARGUMENTS : ${derniers}

Analyse cet argument : "${argument}"

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "scores": { "logique": 7, "sources": 5, "persuasion": 8 },
  "pointsForts": ["Point fort 1", "Point fort 2"],
  "pointsAmeliorer": ["À améliorer 1", "À améliorer 2"],
  "suggestion": "Suggestion concrète pour renforcer l'argument",
  "moduleRecommande": "Nom du module de formation juridique recommandé"
}
Sois encourageant mais honnête. Réponds en français.`,
      }],
    });

    const texte = (message.content[0] as any).text;
    const clean = texte.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  // ── Parcours personnalisé — adapté au domaine ──────────────
  async parcoursPersonnalise(
    niveau: string,
    pointsFaibles: string[],
    tenantSlug: string,
  ): Promise<string> {
    const domainHint = PARCOURS_DOMAIN_HINTS[tenantSlug] ?? '';

    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 700,
      messages: [{
        role:    'user',
        content: `Tu es formateur expert ${domainHint}.
Niveau de l'apprenant : "${niveau}".
Points faibles identifiés : ${pointsFaibles.join(', ')}.
Propose un parcours d'apprentissage personnalisé en 5 étapes concrètes, adapté au contexte haïtien.
Réponds en français de façon structurée avec des numéros.`,
      }],
    });
    return (message.content[0] as any).text;
  }

  // ── Génération de contenu pédagogique ─────────────────────
  async genererContenuLecon(sujet: string, niveau: string, tenantSlug: string): Promise<string> {
    const domainHint = QUIZ_DOMAIN_HINTS[tenantSlug] ?? '';

    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role:    'user',
        content: `Tu es un expert formateur ${domainHint}.
Génère une leçon pédagogique complète en Markdown sur : "${sujet}" (niveau : ${niveau}).
Structure obligatoire :
## Introduction
## Concepts clés
## Exemple concret dans le contexte haïtien
## Points à retenir
## Exercice pratique

Réponds en français, style clair et accessible.`,
      }],
    });
    return (message.content[0] as any).text;
  }

  // ── Simulation clinique (MediForm) ────────────────────────
  async simulationClinique(
    description: string,
    contexte: { typePatient: string; symptomes: string[] },
  ): Promise<{
    evaluation: string;
    etapesSoins: string[];
    alertes: string[];
    protocolesReferencer: string[];
  }> {
    const message = await this.client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role:    'user',
        content: `Tu es un formateur en sciences infirmières pour Haïti (contexte MSPP/OMS).

SIMULATION CLINIQUE :
Patient : ${contexte.typePatient}
Symptômes rapportés : ${contexte.symptomes.join(', ')}
Description de la situation : ${description}

Cette simulation est à des fins ÉDUCATIVES uniquement.

Réponds UNIQUEMENT en JSON valide :
{
  "evaluation": "Évaluation pédagogique de la situation décrite",
  "etapesSoins": ["Étape 1", "Étape 2", "Étape 3"],
  "alertes": ["Signe d'alarme 1", "Signe d'alarme 2"],
  "protocolesReferencer": ["Protocole OMS/MSPP 1", "Protocole 2"]
}
Ne pose pas de diagnostic. Oriente vers un médecin pour les cas réels.`,
      }],
    });

    const texte = (message.content[0] as any).text;
    const clean = texte.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }
}
