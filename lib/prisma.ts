import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma como singleton para não estourar conexões no dev
 * (hot reload) nem em ambientes serverless.
 *
 * `hasDatabase` permite que a landing page funcione mesmo sem DATABASE_URL
 * configurada — a rota da lista de espera degrada com elegância.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
