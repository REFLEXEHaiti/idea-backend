import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { NiveauCours } from '@prisma/client';

export class CreerCoursDto {
  @IsString()
  @MinLength(5)
  titre: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsEnum(NiveauCours)
  @IsOptional()
  niveau?: NiveauCours;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}