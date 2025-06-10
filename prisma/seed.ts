import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const admin = await prisma.users.upsert({
    where: {
      email: 'admin@stiraceconnect.com',
    },
    update: {},
    create: {
      email: 'admin@stiraceconnect.com',
      name: 'System Administrator',
      password: hashedPassword,
      role: Role.Admin,
      phone_number: '+63 123 456 7890',
      address: 'STI Head Office, BGC, Taguig City',
      profile_picture: null, // You can add a default profile picture URL if needed
      settings: {
        create: {
          notifications: {
            email: true,
            push: true,
            eventReminders: true,
            updates: true
          },
          appearance: {
            theme: 'system',
            fontSize: 'normal',
            reducedMotion: false
          },
          security: {
            twoFactorEnabled: false
          }
        }
      }
    }
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 