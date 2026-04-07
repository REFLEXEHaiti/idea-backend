import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class IaService {
  private client: Anthropic;

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('anthropic.apiKey'),
    });
  }

  // Générer un feedback sur les réponses d'un quiz
  async feedbackQuiz(
    score: number,
    questions: any[],
    reponses: number[],
  ): Promise<string> {
    const details = questions.map((q, i) => ({
      question: q.question,
      reponseChoisie: q.options[reponses[i]],
      bonneReponse: q.options[q.reponse],
      correct: reponses[i] === q.reponse,
    }));

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Tu es un formateur expert en débat juridique en Haïti. 
          Un apprenant vient de terminer un quiz avec un score de ${score}%.
          Voici ses réponses : ${JSON.stringify(details)}.
          Donne un feedback encourageant en français (3-4 phrases max), 
          souligne ce qui va bien et donne un conseil précis pour s'améliorer.`,
        },
      ],
    });

    return (message.content[0] as any).text;
  }

  // Générer du contenu pédagogique pour une leçon
  async genererContenuLecon(sujet: string, niveau: string): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en formation au débat juridique pour le contexte haïtien.
          Génère une leçon structurée en Markdown sur le sujet : "${sujet}".
          Niveau : ${niveau}.
          La leçon doit inclure :
          1. Introduction (2-3 phrases)
          2. Concepts clés (3-5 points)
          3. Exemple pratique dans le contexte haïtien
          4. Points à retenir
          Réponds uniquement en français.`,
        },
      ],
    });

    return (message.content[0] as any).text;
  }

  // Générer des questions de quiz sur un sujet
  async genererQuiz(sujet: string, nombreQuestions: number = 5): Promise<any[]> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Génère ${nombreQuestions} questions de quiz en français sur : "${sujet}".
          Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après.
          Format exact :
          [
            {
              "question": "Question ici ?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "reponse": 0
            }
          ]
          "reponse" est l'index (0-3) de la bonne réponse.`,
        },
      ],
    });

    const texte = (message.content[0] as any).text;
    return JSON.parse(texte);
  }

  // Analyser un argument de débat
  async analyserArgument(argument: string): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Tu es un coach en débat juridique haïtien.
          Analyse cet argument en 3-4 phrases en français :
          "${argument}"
          Évalue : la clarté, la logique, et la force de persuasion.
          Donne une note /10 et un conseil d'amélioration.`,
        },
      ],
    });

    return (message.content[0] as any).text;
  }

  // Parcours personnalisé selon le niveau
  async parcoursPersnnalise(
    niveau: string,
    pointsFaibles: string[],
  ): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Tu es un formateur en débat pour la plateforme haïtienne.
          Un apprenant de niveau "${niveau}" a des difficultés sur : ${pointsFaibles.join(', ')}.
          Propose un parcours d'apprentissage personnalisé en 5 étapes en français.
          Chaque étape doit être concrète et adaptée au contexte haïtien.`,
        },
      ],
    });

    return (message.content[0] as any).text;
  }
  async chatbot(message: string): Promise<string> {
  const response = await this.client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: 'Tu es un assistant de la plateforme Debat Haiti. Tu reponds en francais de facon concise. Tu aides les utilisateurs a comprendre la plateforme, les debats, les formations, les tournois et les paiements. Si tu ne sais pas, dis de contacter le support via WhatsApp.',
    messages: [{ role: 'user', content: message }],
  });
  return (response.content[0] as any).text;
}
}