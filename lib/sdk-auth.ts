// lib/sdk-auth.ts
import { auth } from "@/lib/auth"

type SdkAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: { status: number; message: string } }

export async function getUserIdFromApiKey(req: Request): Promise<SdkAuthResult> {
  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return {
      userId: null,
      error: { status: 401, message: "Missing API key" },
    }
  }

  const result = await auth.api.verifyApiKey({
    body: {
      key: apiKey,
      // permissions: { trading: ["read"] }, // plus tard si tu veux des scopes
    },
  })

  if (!result.valid || !result.key) {
    return {
      userId: null,
      error: { status: 401, message: "Invalid API key" },
    }
  }

  return { userId: result.key.userId, error: null }
}

