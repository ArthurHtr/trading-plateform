import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { verifyApiKey } from "@/server/auth/guard.server";
import { z } from "zod";

// Schema de validation strict pour garantir la structure des données
const backtestResultPayloadSchema = z.object({
  metrics: z.object({
    total_return: z.number(),
    final_equity: z.number(),
    total_fees: z.number(),
    total_trades: z.number().int()
  }),
  
  // Liste plate des trades
  trades: z.array(z.object({
    symbol: z.string(),
    side: z.enum(["BUY", "SELL"]),
    price: z.number(),
    quantity: z.number(),
    fee: z.number(),
    timestamp: z.number(),
  })),
  
  // Courbe d'equity globale
  equity_curve: z.array(z.object({
    timestamp: z.number(),
    equity: z.number(),
  })),
  
  // Indicateurs groupés par SYMBOLE puis par NOM
  indicators: z.record(
    z.string(),
    z.record(
        z.string(),
        z.array(z.object({ time: z.number(), value: z.number() }))
    )
  ).optional(),
  
  logs: z.any().optional(),
  params: z.object({
      strategy: z.string().optional(),
      strategy_params: z.any().optional(),
  }).optional(),
});



type RouteContext = { params: { id: string } }

export async function POST(request: Request, { params }: RouteContext) {
  try {

    // seulement depuis l'API (runner distant)
    const hasValidApiKey = await verifyApiKey()
    if (!hasValidApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backtestId = params.id
    const requestBody = await request.json()

    const parsed = backtestResultPayloadSchema.safeParse(requestBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload structure", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const payload = parsed.data

    // on crée le BacktestResult lié au backtest
    await prisma.backtestResult.create({
        data: {
          backtestId,
          totalReturn: payload.metrics.total_return,
          finalEquity: payload.metrics.final_equity,
          totalFees: payload.metrics.total_fees,
          totalTrades: payload.metrics.total_trades,
          trades: payload.trades,
          equityCurve: payload.equity_curve,
          indicators: payload.indicators ?? {},
          logs: payload.logs ?? {},
        },
    });

    // On met a jour le backtest pour indiquer qu'il est COMPLETED, et on enregistre aussi les infos de stratégie
    await prisma.backtest.update({
        where: { id: backtestId },
        data: {
          status: "COMPLETED",
          strategyName: payload.params?.strategy || undefined,
          strategyParams: payload.params?.strategy_params || undefined,
        },
    });

    return NextResponse.json({ success: true, backtestId })
  } catch (err) {
    console.error("Error saving backtest results:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}