"use client";

import { Backtest } from "@prisma/client";
import { TradingChart } from "./chart/trading-chart";
import { OrdersTable } from "./orders-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Eye, EyeOff, BarChart2, LineChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

interface BacktestViewerProps {
  backtest: Backtest;
}

export function BacktestViewer({ backtest }: BacktestViewerProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");

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
          timestamp: detail.trade.timestamp,
        }))
    );
  }, [candlesLogs]);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Symbols Traded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{symbols.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Chart</CardTitle>
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as any)} className="h-8">
                <TabsList className="h-8">
                  <TabsTrigger value="candlestick" className="h-6 px-2 text-xs">
                    <BarChart2 className="h-3 w-3 mr-1" /> Candles
                  </TabsTrigger>
                  <TabsTrigger value="line" className="h-6 px-2 text-xs">
                    <LineChart className="h-3 w-3 mr-1" /> Line
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            <TradingChart 
              data={candles} 
              markers={showMarkers ? markers : []} 
              colors={chartColors}
              type={chartType}
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
