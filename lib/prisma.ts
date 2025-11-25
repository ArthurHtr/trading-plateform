// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

// Évite de recréer un client à chaque hot-reload en dev
export const prisma =
  global.prisma ??
  new PrismaClient({
  })
