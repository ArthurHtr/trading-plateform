import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/features/authentification/server/auth";
import { prisma } from "@/lib/prisma";
import { BacktestViewer } from "@/features/backtest/components/backtest-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BacktestPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const backtest = await prisma.backtest.findUnique({
    where: { id },
  });

  if (!backtest) {
    notFound();
  }

  if (backtest.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Backtest Results</h1>
        <div className="text-muted-foreground mb-4">
          <span className="font-semibold text-foreground">{backtest.strategyName}</span>
          <span className="mx-2">•</span>
          <span>{backtest.symbols.join(", ")}</span>
          <span className="mx-2">•</span>
          <span>{backtest.timeframe}</span>
        </div>
        
        {backtest.strategyParams && typeof backtest.strategyParams === 'object' && (
            <div className="text-sm text-muted-foreground bg-muted/30 border p-3 rounded-md inline-block min-w-[200px]">
                <div className="font-medium mb-2 text-foreground">Strategy Parameters</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                    {Object.entries(backtest.strategyParams as Record<string, any>)
                        .filter(([key]) => key !== 'prices')
                        .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="opacity-70 text-xs uppercase tracking-wider">{key}:</span>
                            <span className="font-mono text-foreground">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
      <BacktestViewer backtest={backtest} />
    </div>
  );
}
