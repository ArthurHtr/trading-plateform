import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyApiKeyFromRequest } from "@/features/authentification/server/verify-api-keys";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify API Key
    const isValid = await verifyApiKeyFromRequest(req);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // The body is expected to be the payload from ResultExporter.export
    // { run_id, params, candles_logs }
    // We store the whole body or just parts of it into the 'results' field.

    const backtest = await prisma.backtest.update({
      where: { id },
      data: {
        status: "COMPLETED",
        results: body, // Storing the full payload
      },
    });

    return NextResponse.json({ success: true, id: backtest.id });
  } catch (error) {
    console.error("Error saving backtest results:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
