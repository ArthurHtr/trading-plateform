import { getSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { z } from "zod"


// Schéma de validation pour la création d'un backtest (pour fit avec Prisma)
const createBacktestInputSchema = z.object({
  symbols: z.array(z.string()).min(1),
  start: z.number().int().positive(),
  end: z.number().int().positive(),
  timeframe: z.string().min(1),
  initialCash: z.number().positive(),
  feeRate: z.number().min(0),
  marginRequirement: z.number().positive(),
})

export async function POST(request: Request) {
  try {
    const userSession = await getSession()

    // Accès réservé aux utilisateurs connectés
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestBody = await request.json()
    const createBacktestInput = createBacktestInputSchema.parse(requestBody)

    const createdBacktest = await prisma.backtest.create({
      data: {
        ...createBacktestInput,
        strategyName: "Strategy",
        userId: userSession.user.id,
        status: "PENDING",
      },
    })

    return NextResponse.json(createdBacktest)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

