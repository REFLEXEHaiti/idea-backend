import { IsEnum, IsUUID } from 'class-validator';
import { TypeVote } from '@prisma/client';

export class CreerVoteDto {
  @IsEnum(TypeVote, { message: 'Le type de vote doit être POUR ou CONTRE' })
  type: TypeVote;

  @IsUUID('4', { message: 'ID de message invalide' })
  messageId: string;
}