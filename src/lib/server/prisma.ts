import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required when live persistence is enabled.");
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}

export function getPrismaClient() {
  globalForPrisma.prisma ??= createPrismaClient();

  return globalForPrisma.prisma;
}
