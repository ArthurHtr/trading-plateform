import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createBacktestSchema = z.object({
  symbols: z.array(z.string()).min(1),
  start: z.string(),
  end: z.string(),
  timeframe: z.string(),
  initialCash: z.number().positive(),
  feeRate: z.number().min(0),
  marginRequirement: z.number().positive(),
  // Strategy is now defined in Python code, but we can keep these optional if we want to store metadata later
  strategyName: z.string().optional(),
  strategyParams: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createBacktestSchema.parse(body);

    const backtest = await prisma.backtest.create({
      data: {
        ...validatedData,
        strategyName: validatedData.strategyName ?? "RemoteStrategy", // Default name if not provided
        userId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(backtest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
