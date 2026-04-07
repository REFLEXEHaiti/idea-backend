import { IsArray, IsString } from 'class-validator';

export class CreerQuizDto {
  @IsString()
  leconId: string;

  // Exemple de structure questions :
  // [{ question: "...", options: ["A","B","C","D"], reponse: 0 }]
  @IsArray()
  questions: {
    question: string;
    options: string[];
    reponse: number; // index de la bonne réponse
  }[];
}