import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('password123');

  const users = [
    {
      email: 'tech-a@fieldops.eval',
      name: 'Tech A',
      role: Role.technician,
      teamId: 'team-alpha',
    },
    {
      email: 'tech-b@fieldops.eval',
      name: 'Tech B',
      role: Role.technician,
      teamId: 'team-beta',
    },
    {
      email: 'supervisor-a@fieldops.eval',
      name: 'Supervisor A',
      role: Role.supervisor,
      teamId: 'team-alpha',
    },
    {
      email: 'admin@fieldops.eval',
      name: 'Admin',
      role: Role.admin,
      teamId: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
      },
    });
  }

  console.log('✅ Seed executada com sucesso.');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });