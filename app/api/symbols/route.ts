import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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
      timeframes: Set<string>,
      minDate: Date | null,
      maxDate: Date | null
    }>();

    groups.forEach(g => {
      if (!symbolMap.has(g.symbol)) {
        symbolMap.set(g.symbol, { 
          timeframes: new Set(),
          minDate: null,
          maxDate: null
        });
      }
      const entry = symbolMap.get(g.symbol)!;
      entry.timeframes.add(g.timeframe);
      
      // Update min/max dates for the symbol (taking the widest range across timeframes, 
      // or we could do it per timeframe, but per symbol is probably enough for now 
      // as usually data is consistent across timeframes or we want the intersection later)
      // Actually, let's track the overall range for the symbol.
      if (!entry.minDate || (g._min.timestamp && g._min.timestamp < entry.minDate)) {
        entry.minDate = g._min.timestamp;
      }
      if (!entry.maxDate || (g._max.timestamp && g._max.timestamp > entry.maxDate)) {
        entry.maxDate = g._max.timestamp;
      }
    });

    const result = Array.from(symbolMap.entries()).map(([symbol, data]) => ({
      symbol,
      timeframes: Array.from(data.timeframes),
      minDate: data.minDate,
      maxDate: data.maxDate,
      base_asset: symbol,
      quote_asset: "USD",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
