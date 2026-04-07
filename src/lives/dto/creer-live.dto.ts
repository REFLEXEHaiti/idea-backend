import { IsString, IsDateString, IsOptional, MinLength } from 'class-validator';

export class CreerLiveDto {
  @IsString()
  @MinLength(5)
  titre: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsDateString()
  dateDebut: string;

  @IsString()
  @IsOptional()
  youtubeUrl?: string;

  @IsString()
  @IsOptional()
  miniatureUrl?: string;
}