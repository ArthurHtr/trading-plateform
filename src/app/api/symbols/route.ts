import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { verifyApiKey, getSession } from "@/server/auth/guard.server";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const headerList = await headers();
    const apiKey = headerList.get("x-api-key");
    
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

    const result = symbolMetadata.map((meta) => {
      const symbol = meta.symbol;
      const candleData = symbolMap.get(symbol);
      
      return {
        symbol,
        timeframes: candleData?.timeframes || {},
        base_asset: meta.baseAsset,
        quote_asset: meta.quoteAsset,
        name: meta.name || symbol,
        sector: meta.sector || "Unknown",
        industry: meta.industry || "Unknown",
        exchange: meta.exchange || "Unknown",
        price_step: meta.priceStep,
        quantity_step: meta.quantityStep,
        min_quantity: meta.minQuantity,
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
