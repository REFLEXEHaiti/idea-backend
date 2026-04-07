// src/auth/dto/login.dto.ts
// Définit et valide les données attendues pour la connexion

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis' })
  motDePasse: string;
}