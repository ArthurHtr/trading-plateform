// lib/auth-client.ts
"use client";

import { apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    apiKeyClient()
  ]
});


// Hooks utiles
export const { useSession } = authClient
export const { signIn, signOut, signUp } = authClient
export const { apiKey } = authClient