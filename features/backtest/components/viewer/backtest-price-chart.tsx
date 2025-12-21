import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { BarChart2, LineChart, Eye, EyeOff, Activity } from "lucide-react";
import { TradingChart } from "../../components/chart/trading-chart";

interface BacktestPriceChartProps {
  candles: any[];
  markers: any[];
  symbols: string[];
  selectedSymbol: string | null;
  onSymbolChange: (symbol: string) => void;
  indicators?: { name: string; overlay: boolean; color?: string; data: any[] }[];
}

export function BacktestPriceChart({ 
  candles, 
  markers, 
  symbols, 
  selectedSymbol, 
  onSymbolChange,
  indicators = []
}: BacktestPriceChartProps) {
  const [chartMode, setChartMode] = useState<"candlestick" | "breakdown">("candlestick");
  const [showMarkers, setShowMarkers] = useState(true);
  const [breakdownVisibility, setBreakdownVisibility] = useState({
    open: false,
    high: false,
    low: false,
    close: true,
  });
  
  // State for indicator visibility
  const [visibleIndicators, setVisibleIndicators] = useState<Record<string, boolean>>({});

  // Initialize all indicators to visible by default when they first load
  useEffect(() => {
    if (indicators.length > 0) {
        setVisibleIndicators(prev => {
            const next = { ...prev };
            let changed = false;
            indicators.forEach(ind => {
                if (next[ind.name] === undefined) {
                    next[ind.name] = true;
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }
  }, [indicators]);

  const chartColors = useMemo(() => ({
    backgroundColor: "transparent",
    textColor: "#333",
  }), []);

  // Helper to generate colors if not provided
  // Avoids OHLCV colors: #fb8c00 (Orange), #43a047 (Green), #e53935 (Red), #2962FF (Blue)
  const getAutoColor = (index: number) => {
    const colors = [
      "#E91E63", // Pink
      "#9C27B0", // Purple
      "#00BCD4", // Cyan
      "#FFEB3B", // Yellow
      "#795548", // Brown
      "#607D8B", // Blue Grey
      "#3F51B5", // Indigo
      "#009688", // Teal
      "#CDDC39", // Lime
      "#9E9E9E", // Grey
    ];
    return colors[index % colors.length];
  };

  // Prepare Price Chart Data based on Mode
  const { priceChartData, priceChartLines, priceChartType, mainSeriesName } = useMemo(() => {
    let lines: any[] = [];
    let data: any[] = [];
    let type: "candlestick" | "line" = "candlestick";
    let mainName: string | undefined = undefined;

    if (chartMode === "candlestick") {
      data = candles;
      type = "candlestick";
    } else {
      // Breakdown mode
      const activeKeys = Object.entries(breakdownVisibility)
        .map(([k, v]) => v ? k : null)
        .filter(Boolean) as string[];
      
      if (activeKeys.length > 0) {
        const mainKey = activeKeys[0];
        const otherKeys = activeKeys.slice(1);

        // Prepare main series data
        data = candles.map((c: any) => ({
          time: c.time,
          open: c.open, high: c.high, low: c.low, 
          close: (c as any)[mainKey], 
          volume: undefined 
        }));
        
        lines = otherKeys.map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          color: key === 'open' ? '#fb8c00' : key === 'high' ? '#43a047' : key === 'low' ? '#e53935' : '#2962FF',
          data: candles.map((c: any) => ({
            time: c.time,
            value: (c as any)[key]
          }))
        }));

        type = "line";
        mainName = mainKey.charAt(0).toUpperCase() + mainKey.slice(1);
      } else {
         type = "line";
         mainName = "";
      }
    }

    // Add Indicators
    indicators.forEach((ind, index) => {
        if (visibleIndicators[ind.name] && ind.overlay) {
            lines.push({
                name: ind.name,
                color: ind.color || getAutoColor(index), 
                data: ind.data
            });
        }
    });

    return {
      priceChartData: data,
      priceChartLines: lines,
      priceChartType: type,
      mainSeriesName: mainName
    };

  }, [candles, chartMode, breakdownVisibility, indicators, visibleIndicators]);

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

          {/* Indicators Dropdown */}
          {indicators.length > 0 && (
             <div className="flex items-center gap-1 border-l pl-4 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                      <Activity className="w-3 h-3" />
                      Indicators
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Indicators</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {indicators.map((ind, index) => (
                      <DropdownMenuCheckboxItem
                        key={ind.name}
                        checked={visibleIndicators[ind.name]}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(checked) => 
                          setVisibleIndicators(prev => ({ ...prev, [ind.name]: !!checked }))
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: ind.color || getAutoColor(index) }}
                          />
                          {ind.name}
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
