import { useMemo } from "react";

interface UseBacktestMetricsProps {
  equityCurve: any[];
  orders: any[];
  initialCash: number;
}

export function useBacktestMetrics({ equityCurve, orders, initialCash }: UseBacktestMetricsProps) {
  const metrics = useMemo(() => {
    if (equityCurve.length === 0) return null;

    const initialEquity = initialCash || equityCurve[0].value;
    const finalEquity = equityCurve[equityCurve.length - 1].value;
    const totalReturn = initialEquity !== 0 
      ? ((finalEquity - initialEquity) / initialEquity) * 100 
      : 0;
    const totalReturnAbs = finalEquity - initialEquity;

    const executedOrders = orders.filter((o: any) => o.status === "FILLED" || o.status === "LIQUIDATED");
    const totalFees = executedOrders.reduce((sum: number, order: any) => sum + (order.fee || 0), 0);

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
      totalTrades: executedOrders.length,
      maxDrawdown: maxDrawdown * 100,
    };
  }, [equityCurve, orders, initialCash]);

  const finalPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    
    orders
      .filter((o: any) => o.status === "FILLED" || o.status === "LIQUIDATED")
      .forEach((order: any) => {
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

  return { metrics, finalPositions };
}
