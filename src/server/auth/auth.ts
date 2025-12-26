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
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((url) => url.trim())
    : [],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Bloque la connexion tant que l'email n'est pas vérifié
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail,
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

import { headers } from "next/headers";

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    return null;
  }
}

