// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const bcrypt = require('bcryptjs');

// Labels des plateformes pour les emails
const TENANT_LABELS: Record<string, { nom: string; couleur: string }> = {
  lex:      { nom: 'LexHaiti',       couleur: '#8B0000' },
  techpro:  { nom: 'TechPro Haiti',  couleur: '#1B3A6B' },
  mediform: { nom: 'MediForm Haiti', couleur: '#1B6B45' },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantsService: TenantsService,
  ) {}

  async inscrire(dto: RegisterDto, tenantSlug: string) {
    if (!tenantSlug) throw new BadRequestException('Tenant manquant (header X-Tenant-ID requis)');

    const tenant = await this.tenantsService.findBySlug(tenantSlug);

    // Email unique par tenant
    const existe = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: dto.email, tenantId: tenant.id } },
    });
    if (existe) throw new ConflictException('Cet email est déjà utilisé sur cette plateforme');

    const hash = await bcrypt.hash(dto.motDePasse, 10);
    const user = await this.prisma.user.create({
      data: {
        email:      dto.email,
        motDePasse: hash,
        prenom:     dto.prenom,
        nom:        dto.nom,
        role:       (dto.role as any) || 'APPRENANT',
        ville:      dto.ville,
        whatsapp:   dto.whatsapp,
        langue:     dto.langue ?? 'fr',
        tenantId:   tenant.id,
      },
    });

    // Créer les points gamification
    await this.prisma.pointsUtilisateur.create({ data: { userId: user.id } });

    const token = this.genererToken(user.id, user.email, user.role, tenant.id, tenantSlug);
    return {
      access_token: token,
      utilisateur: {
        id:       user.id,
        email:    user.email,
        prenom:   user.prenom,
        nom:      user.nom,
        role:     user.role,
        tenantId: user.tenantId,
        tenant:   tenantSlug,
      },
    };
  }

  async connecter(dto: LoginDto, tenantSlug: string) {
    if (!tenantSlug) throw new BadRequestException('Tenant manquant (header X-Tenant-ID requis)');

    const tenant = await this.tenantsService.findBySlug(tenantSlug);

    const user = await this.prisma.user.findUnique({
      where: { email_tenantId: { email: dto.email, tenantId: tenant.id } },
    });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.actif) throw new UnauthorizedException('Compte désactivé');

    const valide = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!valide) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const token = this.genererToken(user.id, user.email, user.role, tenant.id, tenantSlug);
    return {
      access_token: token,
      utilisateur: {
        id:       user.id,
        email:    user.email,
        prenom:   user.prenom,
        nom:      user.nom,
        role:     user.role,
        tenantId: user.tenantId,
        tenant:   tenantSlug,
      },
    };
  }

  async motDePasseOublie(email: string, tenantSlug: string): Promise<void> {
    if (!tenantSlug) throw new BadRequestException('Tenant manquant');
    const tenant = await this.tenantsService.findBySlug(tenantSlug);

    const user = await this.prisma.user.findUnique({
      where: { email_tenantId: { email, tenantId: tenant.id } },
    });
    if (!user) return; // Silencieux pour éviter l'énumération

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpire: expiration },
    });

    const frontendUrl = this.configService.get<string>('frontend.url') ?? 'http://localhost:3000';
    const lien = `${frontendUrl}/auth/reinitialiser-mot-de-passe?token=${token}`;

    const smtpUser = this.configService.get<string>('smtp.user') ?? '';
    const smtpPass = this.configService.get<string>('smtp.pass') ?? '';
    const tenantLabel = TENANT_LABELS[tenantSlug] ?? { nom: tenant.nom, couleur: '#1e3a5f' };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"${tenantLabel.nom}" <${smtpUser}>`,
      to: email,
      subject: `Réinitialisation de votre mot de passe - ${tenantLabel.nom}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border-radius:16px;overflow:hidden">
          <div style="background:${tenantLabel.couleur};padding:32px;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px;font-weight:800">${tenantLabel.nom}</h1>
          </div>
          <div style="background:white;padding:32px">
            <h2 style="color:#111;font-size:20px;font-weight:700;margin:0 0 12px">Réinitialisation de mot de passe</h2>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">
              Bonjour <strong>${user.prenom}</strong>,
            </p>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px">
              Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable <strong>1 heure</strong>.
            </p>
            <div style="text-align:center;margin:28px 0">
              <a href="${lien}" style="display:inline-block;background:${tenantLabel.couleur};color:white;padding:16px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0;line-height:1.6">
              Si vous n'avez pas fait cette demande, ignorez cet email.
            </p>
          </div>
          <div style="background:#f8fafc;padding:16px;text-align:center">
            <p style="color:#94a3b8;font-size:11px;margin:0">© 2026 ${tenantLabel.nom}</p>
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

  private genererToken(id: string, email: string, role: string, tenantId: string, tenantSlug: string): string {
    return this.jwtService.sign({ sub: id, email, role, tenantId, tenantSlug });
  }
}
