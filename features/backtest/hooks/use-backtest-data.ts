import { useState, useMemo, useEffect } from "react";
import { Backtest } from "@prisma/client";

export function useBacktestData(backtest: Backtest) {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [fetchedCandles, setFetchedCandles] = useState<any[]>([]);

  // Parse results safely
  const results = (backtest.results as any) || {};
  const candlesLogs = results.candles_logs || [];

  // Extract symbols
  const symbols = useMemo(() => {
    // 1. Try to get symbols from backtest config (Prisma model)
    if (backtest.symbols && backtest.symbols.length > 0) {
      return backtest.symbols;
    }
    // 2. Fallback to results params
    if (results.params?.symbols && Array.isArray(results.params.symbols)) {
      return results.params.symbols;
    }
    // 3. Fallback to logs
    const s = new Set<string>();
    candlesLogs.forEach((log: any) => {
      if (log.candles) {
        Object.keys(log.candles).forEach((sym) => s.add(sym));
      }
    });
    return Array.from(s);
  }, [candlesLogs, results.params, backtest.symbols]);

  // Set default symbol
  useEffect(() => {
    if (!selectedSymbol && symbols.length > 0) {
      setSelectedSymbol(symbols[0]);
    }
  }, [selectedSymbol, symbols]);

  // Fetch candles when symbol changes
  useEffect(() => {
    if (!selectedSymbol) return;

    // If candles are present in logs (legacy), don't fetch
    const hasCandlesInLogs = candlesLogs.length > 0 && candlesLogs[0].candles && candlesLogs[0].candles[selectedSymbol];
    if (hasCandlesInLogs) {
        setFetchedCandles([]); 
        return;
    }

    // Use backtest config for fetching
    const start = backtest.start;
    const end = backtest.end;
    const timeframe = backtest.timeframe;

    if (!start || !end) return;

    const fetchCandles = async () => {
      try {
        const res = await fetch('/api/candles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbols: [selectedSymbol],
            start: start,
            end: end,
            timeframe: timeframe
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          const symbolCandles = data[selectedSymbol] || [];
          
          const formatted = symbolCandles.map((c: any) => ({
            time: c.timestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
          }));
          setFetchedCandles(formatted);
        }
      } catch (error) {
        console.error("Error fetching candles:", error);
      }
    };

    fetchCandles();
  }, [selectedSymbol, backtest, candlesLogs]);

  // Extract candles for selected symbol
  const candles = useMemo(() => {
    if (!selectedSymbol) return [];
    
    if (fetchedCandles.length > 0) {
        return fetchedCandles;
    }

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
  }, [candlesLogs, selectedSymbol, fetchedCandles]);

  // Extract Equity Curve
  const equityCurve = useMemo(() => {
    return candlesLogs.map((log: any) => ({
      time: log.timestamp,
      value: log.snapshot_after?.equity || 0,
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

  // Extract orders
  const orders = useMemo(() => {
    const allOrders = candlesLogs.flatMap((log: any) =>
      (log.execution_details || [])
        .map((detail: any) => {
          const isLiquidation = detail.status === "liquidated";
          const isRejected = detail.status === "rejected";
          const trade = detail.trade;
          const intent = detail.intent;
          
          // Determine symbol
          const symbol = intent?.symbol || trade?.symbol || "UNKNOWN";
          
          // Determine Side
          let side = "UNKNOWN";
          if (intent?.side) {
             side = intent.side.toString().replace("Side.", ""); 
          } else if (trade) {
             side = trade.quantity > 0 ? "BUY" : "SELL";
          }

          // Determine Type
          const type = intent?.order_type || (isLiquidation ? "LIQUIDATION" : "MARKET");
          
          // Determine Status
          let status = "FILLED";
          if (isLiquidation) status = "LIQUIDATED";
          if (isRejected) status = "REJECTED";

          return {
            id: trade?.trade_id || `${log.timestamp}-${symbol}-${status}-${Math.random()}`,
            symbol: symbol,
            side: side,
            type: type,
            status: status,
            quantity: trade?.quantity || intent?.quantity || 0,
            price: trade?.price || intent?.limit_price || 0,
            fee: trade?.fee || 0,
            timestamp: log.timestamp,
            reason: detail.reason
          };
        })
    );
    return allOrders.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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

  return {
    symbols,
    selectedSymbol,
    setSelectedSymbol,
    candles,
    equityCurve,
    cashCurve,
    orders,
    markers,
    candlesLogs
  };
}
