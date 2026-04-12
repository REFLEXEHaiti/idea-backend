// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(50)
  motDePasse: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  prenom: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nom: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  langue?: string;

  // tenant_id résolu par le middleware — ne pas exposer dans le DTO
}
