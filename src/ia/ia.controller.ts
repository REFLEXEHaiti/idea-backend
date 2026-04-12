// src/ia/ia.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { IaService } from './ia.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ia')
@UseGuards(JwtAuthGuard)
export class IaController {
  constructor(private readonly iaService: IaService) {}

  // ── Chatbot — disponible sur toutes les plateformes
  @Post('chatbot')
  async chatbot(@Body('message') message: string, @Req() req: any) {
    const tenantSlug = req.user.tenantSlug ?? req['tenantSlug'] ?? 'lex';
    return { reponse: await this.iaService.chatbot(message, tenantSlug) };
  }

  // ── Génération de quiz
  @Post('generer-quiz')
  async genererQuiz(
    @Body('sujet') sujet: string,
    @Body('nombreQuestions') nombreQuestions: number,
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    return this.iaService.genererQuiz(sujet, nombreQuestions ?? 5, tenantSlug);
  }

  // ── Feedback quiz
  @Post('feedback-quiz')
  async feedbackQuiz(
    @Body('score') score: number,
    @Body('questions') questions: any[],
    @Body('reponses') reponses: number[],
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    return { feedback: await this.iaService.feedbackQuiz(score, questions, reponses, tenantSlug) };
  }

  // ── Analyse d'argument — LexHaiti uniquement
  @Post('analyser-argument')
  async analyserArgument(
    @Body('argument') argument: string,
    @Body('contexte') contexte: any,
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    if (tenantSlug !== 'lex') {
      return { erreur: "L'analyse d'argument est disponible uniquement sur LexHaiti." };
    }
    return this.iaService.analyserArgument(argument, contexte);
  }

  // ── Parcours personnalisé
  @Post('parcours-personnalise')
  async parcoursPersonnalise(
    @Body('niveau') niveau: string,
    @Body('pointsFaibles') pointsFaibles: string[],
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    return { parcours: await this.iaService.parcoursPersonnalise(niveau, pointsFaibles, tenantSlug) };
  }

  // ── Génération de contenu leçon
  @Post('generer-lecon')
  async genererContenuLecon(
    @Body('sujet') sujet: string,
    @Body('niveau') niveau: string,
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? 'lex';
    return { contenu: await this.iaService.genererContenuLecon(sujet, niveau ?? 'DEBUTANT', tenantSlug) };
  }

  // ── Simulation clinique — MediForm uniquement
  @Post('simulation-clinique')
  async simulationClinique(
    @Body('description') description: string,
    @Body('contexte') contexte: any,
    @Req() req: any,
  ) {
    const tenantSlug = req.user.tenantSlug ?? '';
    if (tenantSlug !== 'mediform') {
      return { erreur: 'Les simulations cliniques sont disponibles uniquement sur MediForm Haiti.' };
    }
    return this.iaService.simulationClinique(description, contexte);
  }
}
