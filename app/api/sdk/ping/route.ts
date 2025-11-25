// app/api/sdk/ping/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const result = await auth.api.verifyApiKey({
    body: {
      key: apiKey,
      // permissions: { projects: ["read"] }, // plus tard
    },
  })

  if (!result.valid || !result.key) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    userId: result.key.userId,
    message: "SDK ping ok",
  })
}

