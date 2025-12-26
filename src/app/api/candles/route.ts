import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { verifyApiKey, getSession } from "@/server/auth/guard.server"
import { z } from "zod"

// NOTE: removed unused `time` import

export async function POST(request: Request) {
  try {

    const hasValidApiKey = await verifyApiKey()
    const userSession = await getSession()

    // Autorise si l'API Key est valide ou si l'utilisateur est connecté
    if (!hasValidApiKey && !userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // On récupère les paramètres de la requête et on les valide
    const candlesQuerySchema = z
      .object({
        symbols: z.array(z.string().min(1)).min(1, "Symbols array is required"),
        start: z.coerce.number().int().positive(),
        end: z.coerce.number().int().positive(),
        timeframe: z.string().min(1, "Timeframe is required"),
      })
      .refine((data) => data.start < data.end, {
        message: "Start timestamp must be less than End timestamp",
        path: ["start"],
      })

    const requestBody = await request.json()
    const parsed = candlesQuerySchema.safeParse(requestBody)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const {
      symbols: requestedSymbols,
      start: startTimestampSec, 
      end: endTimestampSec,      
      timeframe: requestedTimeframe,
    } = parsed.data

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
