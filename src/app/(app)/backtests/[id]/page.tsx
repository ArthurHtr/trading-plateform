import { notFound, redirect } from "next/navigation";
import { getSession } from "@/server/auth/auth";
import { prisma } from "@/server/db";
import { BacktestViewer } from "@/components/backtests/backtest-viewer";
import { DeleteBacktestButton } from "@/components/backtests/delete-backtest-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BacktestPage({ params }: PageProps) {
  const session = await getSession();

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Backtest Results</h1>
          <DeleteBacktestButton backtestId={backtest.id} />
        </div>
        
        <div className="text-sm text-muted-foreground bg-muted/30 border p-4 rounded-md inline-block min-w-[300px]">
            <div className="font-semibold text-lg text-foreground">{backtest.strategyName}</div>
            
            {backtest.strategyParams && typeof backtest.strategyParams === 'object' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 pt-3 border-t border-border/50">
                    {Object.entries(backtest.strategyParams as Record<string, any>)
                        .filter(([key]) => key !== 'prices')
                        .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="opacity-70 text-xs uppercase tracking-wider">{key}:</span>
                            <span className="font-mono text-foreground">{String(value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      <BacktestViewer backtest={backtest} />
    </div>
  );
}
