import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiKeyFromRequest } from "@/features/authentification/server/verify-api-keys";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API Key (since this is called by the Python SDK)
    const isValid = await verifyApiKeyFromRequest(req);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const backtest = await prisma.backtest.findUnique({
      where: { id },
      select: {
        id: true,
        symbols: true,
        start: true,
        end: true,
        timeframe: true,
        initialCash: true,
        feeRate: true,
        marginRequirement: true,
        strategyName: true,
        strategyParams: true,
        seed: true,
        status: true,
      },
    });

    if (!backtest) {
      return NextResponse.json({ error: "Backtest not found" }, { status: 404 });
    }

    return NextResponse.json(backtest);
  } catch (error) {
    console.error("Error fetching backtest:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
