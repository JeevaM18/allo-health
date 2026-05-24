import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL!;

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 1, 
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}