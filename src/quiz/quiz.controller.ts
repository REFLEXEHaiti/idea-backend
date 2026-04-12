// src/quiz/quiz.controller.ts
import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('lecon/:leconId')
  async findByLecon(@Param('leconId') leconId: string) {
    return this.quizService.findByLecon(leconId);
  }

  @Get('mes-resultats')
  @UseGuards(JwtAuthGuard)
  async getMesResultats(@Req() req: any) {
    return this.quizService.getMesResultats(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  async creer(@Body() body: any) {
    return this.quizService.creer(body);
  }

  @Post(':id/soumettre')
  @UseGuards(JwtAuthGuard)
  async soumettre(@Param('id') quizId: string, @Body('reponses') reponses: number[], @Req() req: any) {
    return this.quizService.soumettre(req.user.id, quizId, reponses);
  }
}
