"use client";

import { Backtest } from "@prisma/client";
import { useBacktestData } from "./use-backtest-data";
import { useBacktestMetrics } from "./use-backtest-metrics";
import { BacktestHeader } from "../components/viewer/backtest-header";
import { BacktestMetrics } from "../components/viewer/backtest-metrics";
import { BacktestPriceChart } from "../components/viewer/backtest-price-chart";
import { BacktestPerformanceChart } from "../components/viewer/backtest-performance-chart";
import { BacktestTabs } from "../components/viewer/backtest-tabs";

interface BacktestViewerProps {
  backtest: Backtest;
}

export function BacktestViewer({ backtest }: BacktestViewerProps) {
  const {
    symbols,
    selectedSymbol,
    setSelectedSymbol,
    candles,
    equityCurve,
    cashCurve,
    orders,
    markers,
    candlesLogs,
    indicators
  } = useBacktestData(backtest);

  const { metrics, finalPositions } = useBacktestMetrics({
    equityCurve,
    orders,
    initialCash: backtest.initialCash
  });

  if (!backtest) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold">Backtest not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BacktestHeader backtest={backtest} />

      {metrics && (
        <BacktestMetrics metrics={metrics} symbolCount={symbols.length} />
      )}

      <div className="flex flex-col gap-6">
        <BacktestPriceChart 
          candles={candles}
          markers={markers}
          symbols={symbols}
          selectedSymbol={selectedSymbol}
          onSymbolChange={setSelectedSymbol}
          indicators={indicators}
        />

        {metrics && (
          <BacktestPerformanceChart 
            equityCurve={equityCurve}
            cashCurve={cashCurve}
          />
        )}
      </div>

      {metrics && (
        <BacktestTabs 
          orders={orders}
          candlesLogs={candlesLogs}
          symbols={symbols}
          finalPositions={finalPositions}
        />
      )}
    </div>
  );
}
