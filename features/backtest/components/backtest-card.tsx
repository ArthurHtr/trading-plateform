import { Backtest } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, Clock, TrendingUp, ArrowRight, Activity } from "lucide-react";
import { DeleteBacktestButton } from "../client/delete-backtest-button";

interface BacktestCardProps {
  backtest: Backtest;
}

export function BacktestCard({ backtest }: BacktestCardProps) {
  // Try to extract metrics if available
  const results = backtest.results as any;
  const metrics = results?.metrics; // Assuming metrics might be stored here or calculated
  
  // If metrics are not directly available in a simple way without heavy calculation, 
  // we might just show basic info. 
  // But let's try to show at least if it's completed.
  
  const statusColor = {
    PENDING: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    RUNNING: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    FAILED: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  }[backtest.status] || "bg-gray-500/10 text-gray-500";

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md border-muted/60">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0 flex-1">
            <h3 className="font-semibold leading-none tracking-tight truncate text-base" title={backtest.strategyName}>
              {backtest.strategyName}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={statusColor + " border-0 text-[10px] px-1.5 py-0 h-5 shrink-0"}>
                {backtest.status}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(backtest.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-1">
              ID: {backtest.id}
            </div>
          </div>
          <DeleteBacktestButton 
            backtestId={backtest.id} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-2"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {backtest.symbols.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                {s}
              </Badge>
            ))}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
              {backtest.timeframe}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {backtest.start} - {backtest.end}
            </span>
          </div>
        </div>

        {/* Strategy Params Preview */}
        {backtest.strategyParams && typeof backtest.strategyParams === 'object' && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
             {Object.entries(backtest.strategyParams as Record<string, any>)
                .filter(([key]) => key !== 'prices')
                .map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="opacity-70 text-[10px] uppercase">{key}</span>
                  <span className="font-medium text-foreground truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/backtests/${backtest.id}`} className="w-full">
          <Button variant="outline" className="w-full justify-between group-hover:border-primary/50 group-hover:bg-accent/50 transition-colors">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              View Results
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
