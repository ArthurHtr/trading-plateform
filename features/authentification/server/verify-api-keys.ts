// features/authentification/server/auth-api-keys.ts
import { auth } from "@/features/authentification/server/auth"

export async function verifyApiKeyFromRequest(req: Request) {

  const apiKey = req.headers.get("x-api-key")
  if (!apiKey) return false

  const result = await auth.api.verifyApiKey({
    body: { key: apiKey },
  })

  return result
}



