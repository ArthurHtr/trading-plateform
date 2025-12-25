import { useState, useMemo } from "react";
// Chart component for displaying Equity and Cash curves
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { TrendingUp, DollarSign } from "lucide-react";
import { TradingChart } from "../../components/chart/trading-chart";

interface BacktestPerformanceChartProps {
  equityCurve: { time: string | number; value: number }[];
  cashCurve: { time: string | number; value: number }[];
}

export function BacktestPerformanceChart({ 
  equityCurve, 
  cashCurve 
}: BacktestPerformanceChartProps) {
  const [showEquity, setShowEquity] = useState(true);
  const [showCash, setShowCash] = useState(false);

  const chartColors = useMemo(() => ({
    backgroundColor: "transparent",
    textColor: "#333",
  }), []);

  const { chartData, chartLines, mainSeriesName } = useMemo(() => {
    // Determine main series (Equity takes precedence if both are shown, or if only Equity is shown)
    // If only Cash is shown, Cash is main.
    // If both, Equity is main (Area), Cash is line.
    
    let data: any[] = [];
    let lines: any[] = [];
    let name = "";

    if (showEquity) {
      data = equityCurve.map(d => ({
        time: d.time,
        close: d.value,
        open: d.value,
        high: d.value,
        low: d.value,
      }));
      name = "Equity";

      if (showCash) {
        lines.push({
          name: "Cash",
          color: "#82ca9d",
          data: cashCurve.map(d => ({
            time: d.time,
            value: d.value
          }))
        });
      }
    } else if (showCash) {
      data = cashCurve.map(d => ({
        time: d.time,
        close: d.value,
        open: d.value,
        high: d.value,
        low: d.value,
      }));
      name = "Cash";
    }

    return { chartData: data, chartLines: lines, mainSeriesName: name };
  }, [equityCurve, cashCurve, showEquity, showCash]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <CardTitle>Performance</CardTitle>
          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
            <Button
              variant={showEquity ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowEquity(!showEquity)}
              className="h-7 px-2 text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Equity
            </Button>
            <Button
              variant={showCash ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowCash(!showCash)}
              className="h-7 px-2 text-xs"
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Cash
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] p-0 pb-4 px-4">
        <div className="h-full w-full min-h-[300px]">
          <TradingChart 
            data={chartData} 
            lines={chartLines}
            type="area"
            colors={chartColors}
            mainSeriesName={mainSeriesName}
          />
        </div>
      </CardContent>
    </Card>
  );
}
