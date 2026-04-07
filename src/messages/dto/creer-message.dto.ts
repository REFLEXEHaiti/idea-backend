import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreerMessageDto {
  @IsString()
  @MinLength(2, { message: 'Le message doit contenir au moins 2 caractères' })
  @MaxLength(2000)
  contenu: string;

  @IsUUID('4', { message: 'ID de débat invalide' })
  debatId: string;
}