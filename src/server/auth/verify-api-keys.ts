// features/authentification/server/auth-api-keys.ts
import { auth } from "@/server/auth/auth"

export async function verifyApiKeyFromRequest(req: Request) {

  const apiKey = req.headers.get("x-api-key")
  if (!apiKey) return false

  try {
    const result = await auth.api.verifyApiKey({
        body: { key: apiKey },
    })

    if (!result || (result as any).error) {
        return false
    }

    return true
  } catch (error) {
    return false
  }
}



