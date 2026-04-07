import { IsArray, IsString } from 'class-validator';

export class SoumettreQuizDto {
  @IsString()
  quizId: string;

  @IsArray()
  reponses: number[]; // index des réponses choisies
}