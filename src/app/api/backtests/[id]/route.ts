import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { verifyApiKey } from "@/server/auth/guard.server"

type RouteContext = { params: { id: string } }

export async function GET(request: Request, { params }: RouteContext) {
  try {

    // seulement depuis l'API (runner distant)
    const hasValidApiKey = await verifyApiKey()
    if (!hasValidApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backtestId = params.id

    // On recupère ce dont le runner a besoin pour exécuter le backtest
    const backtestConfig = await prisma.backtest.findUnique({
      where: { id: backtestId },
      select: {
        id: true,
        symbols: true,
        start: true,
        end: true,
        timeframe: true,
        initialCash: true,
        feeRate: true,
        marginRequirement: true,
        strategyName: true,
        strategyParams: true
      },
    })

    if (!backtestConfig) {
      return NextResponse.json({ error: "Backtest not found" }, { status: 404 })
    }

    return NextResponse.json(backtestConfig, {
      headers: {
        "Cache-Control": "private, max-age=0, no-store",
      },
    })
  } catch (err) {
    console.error("Error fetching backtest config:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
