import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Get all distinct combinations of symbol and timeframe
    const groups = await prisma.candle.groupBy({
      by: ['symbol', 'timeframe'],
    });

    // Aggregate timeframes per symbol
    const symbolMap = new Map<string, Set<string>>();

    groups.forEach(g => {
      if (!symbolMap.has(g.symbol)) {
        symbolMap.set(g.symbol, new Set());
      }
      symbolMap.get(g.symbol)?.add(g.timeframe);
    });

    const result = Array.from(symbolMap.entries()).map(([symbol, timeframes]) => ({
      symbol,
      timeframes: Array.from(timeframes),
      base_asset: symbol,
      quote_asset: "USD",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
