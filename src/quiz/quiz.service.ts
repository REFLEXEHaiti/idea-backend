// src/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async creer(data: { leconId: string; questions: any[] }) {
    return this.prisma.quiz.create({
      data: { leconId: data.leconId, questions: data.questions },
    });
  }

  async findByLecon(leconId: string) {
    return this.prisma.quiz.findUnique({ where: { leconId } });
  }

  async soumettre(userId: string, quizId: string, reponses: number[]) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz introuvable');

    const questions = quiz.questions as any[];
    let bonnesReponses = 0;
    questions.forEach((q, i) => { if (reponses[i] === q.reponse) bonnesReponses++; });
    const score = Math.round((bonnesReponses / questions.length) * 100);

    const resultat = await this.prisma.resultatQuiz.create({
      data: { userId, quizId, score, reponses },
    });

    // Attribuer des points de gamification
    await this.prisma.pointsUtilisateur.upsert({
      where: { userId },
      update: { points: { increment: score >= 70 ? 20 : 10 } },
      create: { userId, points: score >= 70 ? 20 : 10 },
    });

    return {
      score,
      bonnesReponses,
      totalQuestions: questions.length,
      reussi: score >= 70,
      resultat,
    };
  }

  async getMesResultats(userId: string) {
    return this.prisma.resultatQuiz.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        quiz: { include: { lecon: { select: { titre: true, coursId: true } } } },
      },
    });
  }
}
