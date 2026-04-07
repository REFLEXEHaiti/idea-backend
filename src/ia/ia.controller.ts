import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IaService } from './ia.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

class AnalyserArgumentDto {
  @IsString()
  argument: string;
}

class GenererQuizDto {
  @IsString()
  sujet: string;

  @IsNumber()
  @IsOptional()
  nombreQuestions?: number;
}

class GenererLeconDto {
  @IsString()
  sujet: string;

  @IsString()
  niveau: string;
}

@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  // POST /api/ia/analyser-argument
  @UseGuards(JwtAuthGuard)
  @Post('analyser-argument')
  async analyserArgument(@Body() dto: AnalyserArgumentDto) {
    const feedback = await this.iaService.analyserArgument(dto.argument);
    return { feedback };
  }

  // POST /api/ia/generer-quiz
  @UseGuards(JwtAuthGuard)
  @Post('generer-quiz')
  async genererQuiz(@Body() dto: GenererQuizDto) {
    const questions = await this.iaService.genererQuiz(
      dto.sujet,
      dto.nombreQuestions,
    );
    return { questions };
  }

  // POST /api/ia/generer-lecon
  @UseGuards(JwtAuthGuard)
  @Post('generer-lecon')
  async genererLecon(@Body() dto: GenererLeconDto) {
    const contenu = await this.iaService.genererContenuLecon(
      dto.sujet,
      dto.niveau,
    );
    return { contenu };
  }
  @UseGuards(JwtAuthGuard)
@Post('chatbot')
async chatbot(@Body() body: { message: string }) {
  const reponse = await this.iaService.chatbot(body.message);
  return { reponse };
}
}