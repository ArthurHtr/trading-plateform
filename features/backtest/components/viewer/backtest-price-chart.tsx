import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { BarChart2, LineChart, Eye, EyeOff } from "lucide-react";
import { TradingChart } from "../../components/chart/trading-chart";

interface BacktestPriceChartProps {
  candles: any[];
  markers: any[];
  symbols: string[];
  selectedSymbol: string | null;
  onSymbolChange: (symbol: string) => void;
}

export function BacktestPriceChart({ 
  candles, 
  markers, 
  symbols, 
  selectedSymbol, 
  onSymbolChange 
}: BacktestPriceChartProps) {
  const [chartMode, setChartMode] = useState<"candlestick" | "breakdown">("candlestick");
  const [showMarkers, setShowMarkers] = useState(true);
  const [breakdownVisibility, setBreakdownVisibility] = useState({
    open: false,
    high: false,
    low: false,
    close: true,
  });

  const chartColors = useMemo(() => ({
    backgroundColor: "transparent",
    textColor: "#333",
  }), []);

  // Prepare Price Chart Data based on Mode
  const { priceChartData, priceChartLines, priceChartType, mainSeriesName } = useMemo(() => {
    if (chartMode === "candlestick") {
      return {
        priceChartData: candles,
        priceChartLines: [],
        priceChartType: "candlestick" as const,
        mainSeriesName: undefined
      };
    }

    // Breakdown mode
    const activeKeys = Object.entries(breakdownVisibility)
      .map(([k, v]) => v ? k : null)
      .filter(Boolean) as string[];
    
    if (activeKeys.length === 0) {
       return {
         priceChartData: [],
         priceChartLines: [],
         priceChartType: "line" as const,
         mainSeriesName: ""
       };
    }

    const mainKey = activeKeys[0];
    const otherKeys = activeKeys.slice(1);

    // Prepare main series data
    const data = candles.map((c: any) => ({
      time: c.time,
      open: c.open, high: c.high, low: c.low, 
      close: (c as any)[mainKey], 
      volume: undefined 
    }));
    const lines = otherKeys.map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      color: key === 'open' ? '#fb8c00' : key === 'high' ? '#43a047' : key === 'low' ? '#e53935' : '#2962FF',
      data: candles.map((c: any) => ({
        time: c.time,
        value: (c as any)[key]
      }))
    }));

    return {
      priceChartData: data,
      priceChartLines: lines,
      priceChartType: "line" as const,
      mainSeriesName: mainKey.charAt(0).toUpperCase() + mainKey.slice(1)
    };

  }, [candles, chartMode, breakdownVisibility]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <CardTitle>Price Chart</CardTitle>
          
          {/* Chart Mode Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-1">
            <Button
              variant={chartMode === "candlestick" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartMode("candlestick")}
              className="h-7 px-2 text-xs"
            >
              <BarChart2 className="w-3 h-3 mr-1" />
              Candles
            </Button>
            <Button
              variant={chartMode === "breakdown" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartMode("breakdown")}
              className="h-7 px-2 text-xs"
            >
              <LineChart className="w-3 h-3 mr-1" />
              OHLCV
            </Button>
          </div>

          {/* Breakdown Toggles */}
          {chartMode === "breakdown" && (
            <div className="flex items-center gap-1 border-l pl-4 ml-2">
              {(['open', 'high', 'low', 'close'] as const).map((key) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setBreakdownVisibility(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`h-7 px-2 text-xs uppercase ${!breakdownVisibility[key] ? "opacity-50" : ""}`}
                >
                  <div 
                    className={`w-2 h-2 rounded-full mr-1`} 
                    style={{ 
                      backgroundColor: !breakdownVisibility[key] ? 'gray' :
                        key === 'open' ? '#fb8c00' : 
                        key === 'high' ? '#43a047' : 
                        key === 'low' ? '#e53935' : 
                        key === 'close' ? '#2962FF' : '#26a69a'
                    }} 
                  />
                  {key.slice(0, 1)}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-l pl-4 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMarkers(!showMarkers)}
              className="h-8 px-2 text-xs"
            >
              {showMarkers ? (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hide Trades
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Show Trades
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSymbol || ""}
            onChange={(e) => onSymbolChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[400px] p-0 pb-4 px-4">
        <div className="h-full w-full min-h-[400px]">
          <TradingChart 
            data={priceChartData} 
            markers={showMarkers ? markers : []} 
            lines={priceChartLines}
            colors={chartColors}
            type={priceChartType}
            mainSeriesName={mainSeriesName}
          />
        </div>
      </CardContent>
    </Card>
  );
}
