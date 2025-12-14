"use client";

import { Backtest } from "@prisma/client";
import { TradingChart } from "./chart/trading-chart";
import { OrdersTable } from "./orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Eye, EyeOff, BarChart2, LineChart, TrendingUp, DollarSign, Percent, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface BacktestViewerProps {
  backtest: Backtest;
}

export function BacktestViewer({ backtest }: BacktestViewerProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "equity">("candlestick");

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

  // Extract orders
  const orders = useMemo(() => {
    return candlesLogs.flatMap((log: any) =>
      (log.execution_details || [])
        .filter((detail: any) => detail.status === "executed" && detail.trade)
        .map((detail: any) => ({
          id: detail.trade.trade_id || `${log.timestamp}-${detail.intent.symbol}`,
          symbol: detail.intent.symbol,
          side: detail.intent.side,
          type: detail.intent.order_type || "MARKET",
          status: "FILLED",
          quantity: detail.trade.quantity,
          price: detail.trade.price,
          fee: detail.trade.fee || 0,
          timestamp: detail.trade.timestamp,
        }))
    );
  }, [candlesLogs]);

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

    return {
      initialEquity,
      finalEquity,
      totalReturn,
      totalReturnAbs,
      totalFees,
      totalTrades: orders.length,
    };
  }, [equityCurve, orders, backtest.initialCash]);

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

  // Determine data to show based on chart type
  const chartData = chartType === "equity" ? equityCurve : candles;
  const chartMarkers = chartType === "equity" ? [] : (showMarkers ? markers : []);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>{chartType === "equity" ? "Equity Curve" : "Price Chart"}</CardTitle>
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)} className="h-8">
                <TabsList className="h-8">
                  <TabsTrigger value="candlestick" className="h-6 px-2 text-xs">
                    <BarChart2 className="h-3 w-3 mr-1" /> Candles
                  </TabsTrigger>
                  <TabsTrigger value="line" className="h-6 px-2 text-xs">
                    <LineChart className="h-3 w-3 mr-1" /> Line
                  </TabsTrigger>
                  <TabsTrigger value="equity" className="h-6 px-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" /> Equity
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {chartType !== "equity" && (
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
              )}
            </div>
          </div>
          {chartType !== "equity" && (
            <div className="flex gap-2">
              {symbols.map((sym) => (
                <Badge
                  key={sym}
                  variant={selectedSymbol === sym ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedSymbol(sym)}
                >
                  {sym}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <TradingChart 
              data={chartData} 
              markers={chartMarkers} 
              colors={chartColors}
              type={chartType === "equity" ? "line" : chartType}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
        {symbols.map((sym) => {
          const symOrders = orders.filter((o: any) => o.symbol === sym);
          return (
            <Card key={sym} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{sym} Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <OrdersTable orders={symOrders} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
