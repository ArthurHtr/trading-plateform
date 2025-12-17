import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/features/authentification/server/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { BacktestCard } from "@/features/backtest/components/backtest-card";

export default async function BacktestsListPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const backtests = await prisma.backtest.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backtests</h1>
          <p className="text-muted-foreground">
            Manage and view your backtest results.
          </p>
        </div>
        <Link href="/backtests/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Backtest
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {backtests.map((backtest) => (
          <BacktestCard key={backtest.id} backtest={backtest} />
        ))}
      </div>
      
      {backtests.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed bg-muted/10">
          <p className="text-muted-foreground mb-4">No backtests found.</p>
          <Link href="/backtests/create">
            <Button variant="outline">Create your first backtest</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
