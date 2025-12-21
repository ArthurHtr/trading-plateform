import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TrendingUp, DollarSign, ArrowDown, Activity, BarChart2 } from "lucide-react";

interface BacktestMetricsProps {
  metrics: {
    totalReturn: number;
    totalReturnAbs: number;
    finalEquity: number;
    initialEquity: number;
    maxDrawdown: number;
    totalFees: number;
    totalTrades: number;
  };
  symbolCount: number;
}

export function BacktestMetrics({ metrics, symbolCount }: BacktestMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          <TrendingUp className={`h-4 w-4 ${metrics.totalReturn >= 0 ? "text-green-500" : "text-red-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
            {metrics.totalReturn > 0 ? "+" : ""}{metrics.totalReturn.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalReturnAbs > 0 ? "+" : ""}{metrics.totalReturnAbs.toFixed(2)} (Abs)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Final Equity</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.finalEquity.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Initial: {metrics.initialEquity.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          <ArrowDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{metrics.maxDrawdown.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Peak to Trough
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -{metrics.totalFees.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Commissions & Fees
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTrades}</div>
          <p className="text-xs text-muted-foreground">
            Across {symbolCount} symbols
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
