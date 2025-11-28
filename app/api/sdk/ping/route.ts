// app/api/sdk/ping/route.ts
import { NextResponse } from "next/server"
import { getUserIdFromApiKey } from "@/lib/auth-api-keys"

export async function GET(req: Request) {
  const { userId, error } = await getUserIdFromApiKey(req)

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: error.status },
    )
  }

  return NextResponse.json({
    ok: true,
    userId,
    message: "SDK ping ok",
  })
}


