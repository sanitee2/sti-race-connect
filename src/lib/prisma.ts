import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * 
 * Learn more: 
 * https://pris.ly/d/help/next-js-best-practices
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Increase connection timeout for Vercel serverless functions
    datasources: {
      db: {
        url: process.env.MONGODB_URI,
      },
    },
  });

// Attach PrismaClient to global object in non-production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma; 