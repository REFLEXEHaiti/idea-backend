import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('inscription')
  async inscrire(@Body() registerDto: RegisterDto) {
    return this.authService.inscrire(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('connexion')
  async connecter(@Body() loginDto: LoginDto) {
    return this.authService.connecter(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('mot-de-passe-oublie')
  async motDePasseOublie(@Body() dto: ForgotPasswordDto) {
    await this.authService.motDePasseOublie(dto.email);
    return { message: 'Email envoyé si le compte existe' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('reinitialiser-mot-de-passe')
  async reinitialiser(@Body() dto: ResetPasswordDto) {
    await this.authService.reinitialiserMotDePasse(dto.token, dto.motDePasse);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}