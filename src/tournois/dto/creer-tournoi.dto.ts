import { IsString, IsNumber, IsDateString, IsOptional, Min, MinLength } from 'class-validator';

export class CreerTournoiDto {
  @IsString()
  @MinLength(5)
  nom: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(4)
  maxEquipes: number;

  @IsDateString()
  dateDebut: string;

  @IsNumber()
  @IsOptional()
  prixInscription?: number;
}