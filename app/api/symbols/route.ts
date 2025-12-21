import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiKeyFromRequest } from "@/features/authentification/server/verify-api-keys";
import { auth } from "@/features/authentification/server/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    
    if (apiKey) {
        const isValid = await verifyApiKeyFromRequest(req);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }
    } else {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // Get all distinct combinations of symbol and timeframe with min/max dates
    const groups = await prisma.candle.groupBy({
      by: ['symbol', 'timeframe'],
      _min: {
        timestamp: true
      },
      _max: {
        timestamp: true
      }
    });

    // Aggregate timeframes per symbol
    const symbolMap = new Map<string, {
      timeframes: Record<string, { min: Date | null, max: Date | null }>,
    }>();

    groups.forEach(g => {
      if (!symbolMap.has(g.symbol)) {
        symbolMap.set(g.symbol, { 
          timeframes: {},
        });
      }
      const entry = symbolMap.get(g.symbol)!;
      entry.timeframes[g.timeframe] = {
        min: g._min.timestamp,
        max: g._max.timestamp
      };
    });

    // Fetch symbol metadata
    const symbolMetadata = await prisma.symbol.findMany();
    const metadataMap = new Map(symbolMetadata.map(s => [s.symbol, s]));

    const result = Array.from(symbolMap.entries()).map(([symbol, data]) => {
      const meta = metadataMap.get(symbol);
      return {
        symbol,
        timeframes: data.timeframes,
        base_asset: meta?.baseAsset || symbol,
        quote_asset: meta?.quoteAsset || "USD",
        price_step: meta?.priceStep || 0.01,
        quantity_step: meta?.quantityStep || 1.0,
        min_quantity: meta?.minQuantity || 1.0,
      };
    });

    return NextResponse.json(result, {
      headers: {
        // Cache for 1 minute, allow stale data for 5 minutes
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
