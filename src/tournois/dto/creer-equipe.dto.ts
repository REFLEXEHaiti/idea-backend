import { IsString, IsArray, IsUUID, MinLength } from 'class-validator';

export class CreerEquipeDto {
  @IsString()
  @MinLength(2)
  nom: string;

  @IsUUID('4')
  tournoiId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  membresIds: string[]; // IDs des membres de l'équipe
}