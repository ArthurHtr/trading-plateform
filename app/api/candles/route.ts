import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiKeyFromRequest } from "@/features/authentification/server/verify-api-keys";
import { auth } from "@/features/authentification/server/auth";

export async function POST(req: Request) {
  try {
    const isApiKeyValid = await verifyApiKeyFromRequest(req);
    let isSessionValid = false;

    if (!isApiKeyValid) {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (session) {
        isSessionValid = true;
      }
    }

    if (!isApiKeyValid && !isSessionValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { symbols, start, end, timeframe } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: "Symbols array is required" }, { status: 400 });
    }

    if (!start || !end) {
      return NextResponse.json({ error: "Start and End dates are required" }, { status: 400 });
    }

    // Parse dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Fetch candles from DB
    // Note: We currently ignore 'timeframe' because we only store 1D candles or raw candles.
    // If you support multiple timeframes, you need a way to filter/aggregate.
    // For now, we assume the DB stores the base timeframe (e.g. 1D) requested.
    
    const candles = await prisma.candle.findMany({
      where: {
        symbol: { in: symbols },
        timeframe: timeframe || "1d", // Default to 1d if not specified
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Group by symbol
    const result: Record<string, any[]> = {};
    symbols.forEach(s => result[s] = []);

    candles.forEach(c => {
      if (result[c.symbol]) {
        result[c.symbol].push({
          timestamp: c.timestamp, // Send raw unix timestamp (Int)
          date: c.date.toISOString().split('T')[0], // Send formatted date string
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
        });
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error fetching candles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
