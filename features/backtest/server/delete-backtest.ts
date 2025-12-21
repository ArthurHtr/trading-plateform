"use server"

import { auth } from "@/features/authentification/server/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteBacktest(backtestId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const backtest = await prisma.backtest.findUnique({
    where: {
      id: backtestId,
    },
    select: {
      userId: true,
    },
  });

  if (!backtest) {
    throw new Error("Backtest not found");
  }

  if (backtest.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.backtest.delete({
    where: {
      id: backtestId,
    },
  });

  revalidatePath("/backtests");
}
