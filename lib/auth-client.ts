// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
});

// Hooks utiles
export const { useSession } = authClient