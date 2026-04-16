import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Admin1234!', 10);
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'lex' } });
  if (!tenant) { console.log('Tenant lex introuvable'); return; }
  const admin = await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@lexhaiti.ht', tenantId: tenant.id } },
    update: {},
    create: {
      email: 'admin@lexhaiti.ht',
      motDePasse: hash,
      prenom: 'Admin',
      nom: 'LexHaiti',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });
  console.log('Admin créé :', admin.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
