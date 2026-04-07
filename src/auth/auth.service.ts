// src/auth/auth.service.ts
// CORRECTIONS :
//   1. PrismaClient remplacé par PrismaService injecté (singleton)
//   2. Credentials SMTP hardcodés supprimés — lus uniquement depuis .env
//   3. bcrypt importé proprement (ES module)

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async inscrire(dto: RegisterDto) {
    const existe = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Cet email est deja utilise');

    const hash = await bcrypt.hash(dto.motDePasse, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        motDePasse: hash,
        prenom: dto.prenom,
        nom: dto.nom,
        role: (dto.role as any) || 'APPRENANT',
        ville: dto.ville,
      },
    });

    const token = this.genererToken(user.id, user.email, user.role);
    return {
      access_token: token,
      utilisateur: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
      },
    };
  }

  async connecter(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valide = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!valide) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const token = this.genererToken(user.id, user.email, user.role);
    return {
      access_token: token,
      utilisateur: {
        id: user.id,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
      },
    };
  }

  async motDePasseOublie(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silencieux — ne révèle pas si l'email existe

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1 heure

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpire: expiration },
    });

    const frontendUrl =
      this.configService.get<string>('frontend.url') ||
      'https://plateforme-debat-frontend.vercel.app';
    const lien = `${frontendUrl}/auth/reinitialiser-mot-de-passe?token=${token}`;

    // CORRECTION : plus de credentials hardcodés — lus depuis .env uniquement
    const smtpUser = this.configService.get<string>('smtp.user');
    const smtpPass = this.configService.get<string>('smtp.pass');

    if (!smtpUser || !smtpPass) {
      console.error('SMTP non configuré — vérifiez SMTP_USER et SMTP_PASS dans .env');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Débat Haïti" <${smtpUser}>`,
      to: email,
      subject: 'Reinitialisation de votre mot de passe - Debat Haiti',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8fafc;padding:0;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0A2540,#001F3F);padding:32px 32px 24px;text-align:center">
            <div style="font-size:36px;margin-bottom:8px">🇭🇹</div>
            <h1 style="color:white;margin:0;font-size:22px;font-weight:800">Débat Haïti</h1>
          </div>
          <div style="background:white;padding:32px">
            <h2 style="color:#0A2540;font-size:20px;font-weight:800;margin:0 0 12px">🔐 Réinitialisation de mot de passe</h2>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Bonjour <strong>${user.prenom}</strong>,</p>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px">
              Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable <strong>1 heure</strong>.
            </p>
            <div style="text-align:center;margin:28px 0">
              <a href="${lien}" style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#7B61FF);color:white;padding:16px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px">
                Réinitialiser mon mot de passe →
              </a>
            </div>
            <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0;line-height:1.6">
              Si vous n'avez pas fait cette demande, ignorez cet email.
            </p>
          </div>
        </div>`,
    });
  }

  async reinitialiserMotDePasse(token: string, motDePasse: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpire: { gt: new Date() } },
    });
    if (!user) throw new UnauthorizedException('Token invalide ou expiré');

    const hash = await bcrypt.hash(motDePasse, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { motDePasse: hash, resetToken: null, resetTokenExpire: null },
    });
  }

  private genererToken(id: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: id, email, role });
  }
}
