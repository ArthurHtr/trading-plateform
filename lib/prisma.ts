// lib/prisma.ts
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import path from "path"

if (process.env.NODE_ENV === "production") {
  // En PROD : Charge le .env depuis un chemin spécifique
  dotenv.config({ path: path.resolve(process.cwd(), "/etc/tbf_tpf_prod/tbf_tpf_prod.env") })
} else {
  // En DEV : Charge le .env depuis la racine si nécessaire
  if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), ".env") })
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

