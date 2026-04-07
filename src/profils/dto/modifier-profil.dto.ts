import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ModifierProfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  prenom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}