"use client";

import { Backtest } from "@prisma/client";
import { TradingChart } from "./chart/trading-chart";
import { OrdersTable } from "./orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Eye, EyeOff, BarChart2, LineChart, TrendingUp, DollarSign, Percent, Activity, ArrowDown, Filter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { any } from "zod";

interface BacktestViewerProps {
  backtest: Backtest;
}

export function BacktestViewer({ backtest }: BacktestViewerProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showEquity, setShowEquity] = useState(true);
  const [showCash, setShowCash] = useState(true);

  // Price Chart Mode State
  const [chartMode, setChartMode] = useState<"candlestick" | "breakdown">("candlestick");
  const [breakdownVisibility, setBreakdownVisibility] = useState({
    open: false,
    high: false,
    low: false,
    close: true,
  });

  // Filter states for Trade History
  const [tradeFilterSymbol, setTradeFilterSymbol] = useState<string>("ALL");
  const [tradeFilterStartDate, setTradeFilterStartDate] = useState<string>("");
  const [tradeFilterEndDate, setTradeFilterEndDate] = useState<string>("");

  if (!backtest.results) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">No results available</h2>
        <p className="text-muted-foreground">
          This backtest is {backtest.status.toLowerCase()}.
        </p>
      </div>
    );
  }

  // Parse results safely
  const results = backtest.results as any;
  const candlesLogs = results.candles_logs || [];

  // Extract symbols
  const symbols = useMemo(() => {
    const s = new Set<string>();
    candlesLogs.forEach((log: any) => {
      if (log.candles) {
        Object.keys(log.candles).forEach((sym) => s.add(sym));
      }
    });
    return Array.from(s);
  }, [candlesLogs]);

  // Set default symbol
  useEffect(() => {
    if (!selectedSymbol && symbols.length > 0) {
      setSelectedSymbol(symbols[0]);
    }
  }, [selectedSymbol, symbols]);

  // Extract candles for selected symbol
  const candles = useMemo(() => {
    if (!selectedSymbol) return [];
    return candlesLogs
      .map((log: any) => {
        const candle = log.candles?.[selectedSymbol];
        if (!candle) return null;
        return {
          time: log.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        };
      })
      .filter(Boolean);
  }, [candlesLogs, selectedSymbol]);

  // Extract Equity Curve
  const equityCurve = useMemo(() => {
    return candlesLogs.map((log: any) => ({
      time: log.timestamp,
      value: log.snapshot_after?.equity || 0,
      // Map to OHLC for TradingChart compatibility when in "equity" mode
      open: log.snapshot_after?.equity || 0,
      high: log.snapshot_after?.equity || 0,
      low: log.snapshot_after?.equity || 0,
      close: log.snapshot_after?.equity || 0,
    }));
  }, [candlesLogs]);

  // Extract Cash Curve
  const cashCurve = useMemo(() => {
    return candlesLogs.map((log: any) => ({
      time: log.timestamp,
      value: log.snapshot_after?.cash || 0,
    }));
  }, [candlesLogs]);

  // Extract Position Curve (for selected symbol in Trade History)
  const positionCurve = useMemo(() => {
    if (tradeFilterSymbol === "ALL") return [];
    
    return candlesLogs.map((log: any) => {
      const positions = log.snapshot_after?.positions || [];
      // positions is a list of objects {symbol, quantity, ...}
      const pos = positions.find((p: any) => p.symbol === tradeFilterSymbol);
      const quantity = pos ? pos.quantity : 0;
      
      return {
        time: log.timestamp,
        value: quantity,
        open: quantity,
        high: quantity,
        low: quantity,
        close: quantity,
      };
    });
  }, [candlesLogs, tradeFilterSymbol]);

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
    // TradingChart uses 'close' as value for Line series
    const data = candles.map((c: any) => ({
      time: c.time,
      open: c.open, high: c.high, low: c.low, 
      close: (c as any)[mainKey], // Map main key to close
      volume: undefined // No volume in breakdown mode
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



  // Extract orders
  const orders = useMemo(() => {
    const allOrders = candlesLogs.flatMap((log: any) =>
      (log.execution_details || [])
        .filter((detail: any) => (detail.status === "executed" || detail.status === "liquidated") && detail.trade)
        .map((detail: any) => {
          const isLiquidation = detail.status === "liquidated";
          const trade = detail.trade;
          
          // For liquidations, intent is null, so we derive info from trade
          const symbol = detail.intent?.symbol || trade.symbol;
          const side = detail.intent?.side || (trade.quantity > 0 ? "BUY" : "SELL");
          const type = detail.intent?.order_type || (isLiquidation ? "LIQUIDATION" : "MARKET");
          
          return {
            id: trade.trade_id || `${log.timestamp}-${symbol}-${isLiquidation ? 'liq' : 'exec'}`,
            symbol: symbol,
            side: side,
            type: type,
            status: isLiquidation ? "LIQUIDATED" : "FILLED",
            quantity: trade.quantity,
            price: trade.price,
            fee: trade.fee || 0,
            timestamp: trade.timestamp,
          };
        })
    );
    // Sort orders by timestamp ascending (oldest first)
    return allOrders.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [candlesLogs]);

  // Filter orders based on user selection
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchSymbol = tradeFilterSymbol === "ALL" || order.symbol === tradeFilterSymbol;
      
      let matchDate = true;
      if (tradeFilterStartDate || tradeFilterEndDate) {
        // Assuming timestamp is ISO string or compatible
        const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
        if (tradeFilterStartDate && orderDate < tradeFilterStartDate) matchDate = false;
        if (tradeFilterEndDate && orderDate > tradeFilterEndDate) matchDate = false;
      }
      
      return matchSymbol && matchDate;
    });
  }, [orders, tradeFilterSymbol, tradeFilterStartDate, tradeFilterEndDate]);

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (equityCurve.length === 0) return null;

    const initialEquity = backtest.initialCash || equityCurve[0].value;
    const finalEquity = equityCurve[equityCurve.length - 1].value;
    const totalReturn = initialEquity !== 0 
      ? ((finalEquity - initialEquity) / initialEquity) * 100 
      : 0;
    const totalReturnAbs = finalEquity - initialEquity;

    const totalFees = orders.reduce((sum: number, order: any) => sum + (order.fee || 0), 0);

    // Calculate Max Drawdown
    let peak = -Infinity;
    let maxDrawdown = 0;
    
    for (const point of equityCurve) {
      if (point.value > peak) {
        peak = point.value;
      }
      const drawdown = (peak - point.value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      initialEquity,
      finalEquity,
      totalReturn,
      totalReturnAbs,
      totalFees,
      totalTrades: orders.length,
      maxDrawdown: maxDrawdown * 100,
    };
  }, [equityCurve, orders, backtest.initialCash]);

  // Extract Final Positions
  const finalPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    
    orders.forEach((order: any) => {
      const current = positions[order.symbol] || 0;
      positions[order.symbol] = current + order.quantity;
    });
    
    return Object.entries(positions)
      .map(([symbol, quantity]) => ({
        symbol,
        quantity: Number(quantity),
      }))
      .filter(p => !isNaN(p.quantity) && Math.abs(p.quantity) > 0.000001);
  }, [orders]);

  // Transform orders to markers for the chart (filtered by selected symbol)
  const markers = useMemo(() => {
    if (!selectedSymbol) return [];
    return orders
      .filter((o: any) => o.symbol === selectedSymbol)
      .map((o: any) => ({
        time: o.timestamp,
        position: o.side === "BUY" ? "belowBar" : "aboveBar",
        color: o.side === "BUY" ? "#26a69a" : "#ef5350",
        shape: o.side === "BUY" ? "arrowUp" : "arrowDown",
        text: o.side === "BUY" ? "B" : "S",
      }));
  }, [orders, selectedSymbol]);

  const chartColors = useMemo(() => ({
    backgroundColor: "transparent",
    textColor: "#333",
  }), []);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      {metrics && (
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
                Across {symbols.length} symbols
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Main Price Chart */}
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
                onChange={(e) => setSelectedSymbol(e.target.value)}
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
        {/* Side Charts: Equity & Cash */}
        <Card className="flex flex-col">
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEquity(!showEquity)}
                className={`h-6 px-2 text-xs ${!showEquity ? "opacity-50" : ""}`}
              >
                <div className="w-2 h-2 rounded-full bg-[#2962FF] mr-1" />
                Equity
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCash(!showCash)}
                className={`h-6 px-2 text-xs ${!showCash ? "opacity-50" : ""}`}
              >
                <div className="w-2 h-2 rounded-full bg-[#82ca9d] mr-1" />
                Cash
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] p-0 pb-4 px-4">
            <div className="h-full w-full min-h-[400px]">
              <TradingChart 
                data={showEquity ? equityCurve : []} 
                markers={[]} 
                colors={chartColors}
                type="line"
                mainSeriesName="Equity"
                lines={showCash ? [{ name: "Cash", color: "#82ca9d", data: cashCurve }] : []}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trades" className="w-full">
        <TabsList>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="positions">Final Positions</TabsTrigger>
        </TabsList>
        <TabsContent value="trades" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">All Executed Trades</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={tradeFilterSymbol}
                    onChange={(e) => setTradeFilterSymbol(e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="ALL">All Symbols</option>
                    {symbols.map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={tradeFilterStartDate}
                    onChange={(e) => setTradeFilterStartDate(e.target.value)}
                    className="h-8 w-auto"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="date"
                    value={tradeFilterEndDate}
                    onChange={(e) => setTradeFilterEndDate(e.target.value)}
                    className="h-8 w-auto"
                  />
                </div>
                {(tradeFilterSymbol !== "ALL" || tradeFilterStartDate || tradeFilterEndDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTradeFilterSymbol("ALL");
                      setTradeFilterStartDate("");
                      setTradeFilterEndDate("");
                    }}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    title="Clear Filters"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear Filters</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {tradeFilterSymbol !== "ALL" && positionCurve.length > 0 && (
                <div className="mb-6 space-y-2">
                   <h3 className="text-sm font-medium text-muted-foreground">Position History: {tradeFilterSymbol}</h3>
                   <div className="h-[250px] w-full border rounded-md overflow-hidden">
                     <TradingChart 
                        data={positionCurve} 
                        type="line" 
                        colors={{ lineColor: "#8884d8" }}
                        mainSeriesName="Position"
                     />
                   </div>
                </div>
              )}
              <div className="max-h-[600px] overflow-y-auto">
                <OrdersTable orders={filteredOrders} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Portfolio Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalPositions.map((pos) => (
                    <TableRow key={pos.symbol}>
                      <TableCell className="font-medium">{pos.symbol}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                    </TableRow>
                  ))}
                  {finalPositions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No open positions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
