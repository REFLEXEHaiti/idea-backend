import { IsString, IsNumber, IsOptional, MinLength, Min } from 'class-validator';

export class CreerLeconDto {
  @IsString()
  @MinLength(3)
  titre: string;

  @IsString()
  @MinLength(10)
  contenu: string; // texte Markdown

  @IsNumber()
  @Min(1)
  ordre: number;

  @IsNumber()
  @IsOptional()
  dureeMin?: number;

  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @IsString()
  coursId: string;
}