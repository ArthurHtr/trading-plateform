import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { verifyApiKey, getSession } from "@/server/auth/guard.server";
import { headers } from "next/headers";

export async function GET(req: Request) {

  try {

    const headerList = await headers();
    const apiKey = headerList.get("x-api-key");
    
    // verification de l'identité du demandeur
    if (apiKey) {
        const isValid = await verifyApiKey();
        if (!isValid) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }
    } else {
        const session = await getSession();
        if (!session) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // 1. Récupérer les stats des bougies (Timeframes, Dates min/max)
    const groupedCandleRanges = await prisma.candle.groupBy({
      by: ["symbol", "timeframe"],
      _min: { timestamp: true },
      _max: { timestamp: true },
    });

    // 2. Organiser les statistiques par symbole pour un accès rapide
    // Le format retourné sera :
    // {
    //  "BTCUSDT": {
    //    "1m":  { "min": 1700000000, "max": 1730000000 },
    //    "5m":  { "min": 1700000200, "max": 1730000000 },
    //      "1h":  { "min": 1699000000, "max": 1730000000 }
    //    }
    //  }
    const rangesBySymbol = groupedCandleRanges.reduce((acc, stat) => {
      if (!acc.has(stat.symbol)) {
        acc.set(stat.symbol, {});
      }
      acc.get(stat.symbol)![stat.timeframe] = {
        min: stat._min.timestamp,
        max: stat._max.timestamp,
      };
      return acc;
    }, new Map<string, Record<string, { min: number | null; max: number | null }>>());


    // 3. Récupérer et ajouté les stats précédentes tout les symboles
    const symbols = await prisma.symbol.findMany({
      orderBy: { symbol: "asc" },
    });

    const result = symbols.map((s) => ({
      symbol: s.symbol,
      name: s.name || s.symbol,
      base_asset: s.baseAsset,
      quote_asset: s.quoteAsset,
      sector: s.sector || "Unknown",
      industry: s.industry || "Unknown",
      exchange: s.exchange || "Unknown",
      price_step: s.priceStep,
      quantity_step: s.quantityStep,
      min_quantity: s.minQuantity,
      candleRangeByTimeframe: rangesBySymbol.get(s.symbol) || {},
    }));

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
