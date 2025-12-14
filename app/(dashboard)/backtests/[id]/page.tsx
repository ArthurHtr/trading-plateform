import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BacktestViewer } from "@/features/backtest/components/backtest-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BacktestPage({ params }: PageProps) {
  const { id } = await params;

  const backtest = await prisma.backtest.findUnique({
    where: { id },
  });

  if (!backtest) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Backtest Results</h1>
        <p className="text-muted-foreground">
          {backtest.strategyName} - {backtest.symbols.join(", ")}
        </p>
      </div>
      <BacktestViewer backtest={backtest} />
    </div>
  );
}
