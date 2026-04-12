// src/auth/auth.controller.ts
import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('inscription')
  async inscrire(@Body() dto: RegisterDto, @Req() req: Request) {
    const tenantSlug = req['tenantSlug'] as string;
    return this.authService.inscrire(dto, tenantSlug);
  }

  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  async connecter(@Body() dto: LoginDto, @Req() req: Request) {
    const tenantSlug = req['tenantSlug'] as string;
    return this.authService.connecter(dto, tenantSlug);
  }

  @Post('mot-de-passe-oublie')
  @HttpCode(HttpStatus.OK)
  async motDePasseOublie(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const tenantSlug = req['tenantSlug'] as string;
    await this.authService.motDePasseOublie(dto.email, tenantSlug);
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  @Post('reinitialiser-mot-de-passe')
  @HttpCode(HttpStatus.OK)
  async reinitialiserMotDePasse(@Body() dto: ResetPasswordDto) {
    await this.authService.reinitialiserMotDePasse(dto.token, dto.motDePasse);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}
