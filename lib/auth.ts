// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  // 1. DB : Prisma + Postgres
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // 2. Auth par email + mot de passe
  emailAndPassword: {
    enabled: true,
  },

  // 3. Champ role sur l'utilisateur
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // l'utilisateur ne peut pas se donner lui-même 'admin'
      },
    },
  },
});

