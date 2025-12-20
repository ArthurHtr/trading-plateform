// lib/auth.ts (server-side)

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { apiKey } from "better-auth/plugins"

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",") : [])
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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

