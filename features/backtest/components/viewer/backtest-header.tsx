import { Badge } from "@/shared/components/ui/badge";
import { Backtest } from "@prisma/client";

interface BacktestHeaderProps {
  backtest: Backtest;
}

export function BacktestHeader({ backtest }: BacktestHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Backtest Analysis</h2>
        <p className="text-sm text-muted-foreground">
          {backtest.strategyName} • {backtest.timeframe} • {backtest.start} to {backtest.end}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          ID: {backtest.id}
        </p>
      </div>
      <Badge variant={backtest.status === "COMPLETED" ? "default" : backtest.status === "FAILED" ? "destructive" : "secondary"}>
        {backtest.status}
      </Badge>
    </div>
  );
}
