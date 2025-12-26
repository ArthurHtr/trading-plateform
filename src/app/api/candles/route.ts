import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { verifyApiKey, getSession } from "@/server/auth/guard.server"

// NOTE: removed unused `time` import

export async function POST(request: Request) {
  try {

    const hasValidApiKey = await verifyApiKey()
    const userSession = await getSession()

    // Autorise si l'API Key est valide ou si l'utilisateur est connecté
    if (!hasValidApiKey && !userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // recupération du corps de la requete
    const requestBody = await request.json()
    const {
      symbols: requestedSymbols,
      start: startUnixSeconds,
      end: endUnixSeconds,
      timeframe: requestedTimeframe,
    } = requestBody

    const startTimestampSec = Number(startUnixSeconds)
    const endTimestampSec = Number(endUnixSeconds)

    // Input validation
    if (!Array.isArray(requestedSymbols) || requestedSymbols.length === 0) {
      return NextResponse.json(
        { error: "Symbols array is required" }, 
        { status: 400 }
      )
    }
    if (startUnixSeconds == null || endUnixSeconds == null) {
      return NextResponse.json(
        { error: "Start and End timestamps are required" }, 
        { status: 400 }
      )
    }
    if (Number.isNaN(startTimestampSec) || Number.isNaN(endTimestampSec)) {
      return NextResponse.json(
        { error: "Start and End must be valid Unix timestamps (seconds)" }, 
        { status: 400 }
      )
    }
    if (startTimestampSec >= endTimestampSec) {
      return NextResponse.json(
        { error: "Start timestamp must be less than End timestamp" }, 
        { status: 400 }
      )
    }
    if (typeof requestedTimeframe !== "string" || requestedTimeframe.length === 0) {
      return NextResponse.json(
        { error: "Timeframe is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // toutes les bougies dans la plage demandée
    // le format retourné sera :
    // [ { candle1 }, { candle2 }, ... ]
    const candlesInRange = await prisma.candle.findMany({
      where: {
        symbol: { in: requestedSymbols },
        timeframe: requestedTimeframe,
        timestamp: {
          gte: startTimestampSec,
          lte: endTimestampSec,
        },
      },
      orderBy: { timestamp: "asc" },
    })

    // toutes les bougies organisées par symbole
    // le format retourné sera :
    // {
    //   "BTCUSDT": [ { candle1 }, { candle2 }, ... ],
    //   "ETHUSDT": [ { candle1 }, { candle2 }, ... ],
    //    ...
    // }
    const candlesBySymbol: Record<string, any[]> = Object.fromEntries(
      requestedSymbols.map((symbol) => [symbol, []])
    )

    for (const candle of candlesInRange) {
      candlesBySymbol[candle.symbol].push({
        timestamp: candle.timestamp,
        date: candle.date,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      })
    }

    return NextResponse.json(candlesBySymbol)
  } catch (err) {
    console.error("Error fetching candles:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
