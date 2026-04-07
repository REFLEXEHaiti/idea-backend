import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreerQuizDto } from './dto/creer-quiz.dto';
import { SoumettreQuizDto } from './dto/soumettre-quiz.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR')
  @Post()
  async creer(@Body() dto: CreerQuizDto) {
    return this.quizService.creer(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('soumettre')
  async soumettre(@Request() req: any, @Body() dto: SoumettreQuizDto) {
    return this.quizService.soumettre(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mes-resultats')
  async getMesResultats(@Request() req: any) {
    return this.quizService.getMesResultats(req.user.id);
  }
}