// app/api/sdk/ping/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/server/auth/auth"

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing API key" },
      { status: 401 },
    )
  }

  const result = await auth.api.verifyApiKey({
    body: { key: apiKey },
  })

  if (!result.valid || !result.key) {
    return NextResponse.json(
      { ok: false, error: "Invalid API key" },
      { status: 401 },
    )
  }

  return NextResponse.json({
    ok: true,
    userId: result.key.userId,
    message: "SDK ping ok",
  })
}
