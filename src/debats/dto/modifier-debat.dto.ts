import { IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { StatutDebat } from '@prisma/client';

export class ModifierDebatDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  titre?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsEnum(StatutDebat)
  statut?: StatutDebat;
}