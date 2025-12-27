// lib/auth.ts (server-side)

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/server/db"
import { apiKey } from "better-auth/plugins"
import { sendVerificationEmail } from "./email"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    process.env.BETTER_AUTH_TRUSTED_ORIGINS_1!,
    process.env.BETTER_AUTH_TRUSTED_ORIGINS_2!,
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Bloque la connexion tant que l'email n'est pas vérifié
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail,
  },
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  plugins: [
    apiKey({
      rateLimit: {
        enabled: true,
        timeWindow: 60 * 1000,
        maxRequests: 100,
      }
    }),
  ],
})