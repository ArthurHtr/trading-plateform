// lib/auth-client.ts
"use client";

import { apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
  plugins: [
    apiKeyClient()
  ]
});


// Hooks utiles
export const { useSession } = authClient
export const { signIn, signOut, signUp, sendVerificationEmail } = authClient
export const { apiKey } = authClient