import { prisma } from "@/server/db";

type CandleRangeByTimeframe = Record<
  string,
  { minTimestamp: number | null; maxTimestamp: number | null }
>;

export async function getAvailableSymbols() {

  // Aggregate candle coverage per (symbol, timeframe)
  const candleCoverageBySymbolAndTimeframe = await prisma.candle.groupBy({
    by: ["symbol", "timeframe"],
    _min: { timestamp: true },
    _max: { timestamp: true },
  });

  /*
  Example (candleCoverageBySymbolAndTimeframe):
  [
    {
      symbol: "BTCUSDT",
      timeframe: "1m",
      _min: { timestamp: 1704067200000 },
      _max: { timestamp: 1735689600000 }
    },
    {
      symbol: "BTCUSDT",
      timeframe: "5m",
      _min: { timestamp: 1704067200000 },
      _max: { timestamp: 1735689600000 }
    },
    {
      symbol: "AAPL",
      timeframe: "1d",
      _min: { timestamp: 1262304000000 },
      _max: { timestamp: 1735603200000 }
    }
  ]
  */

  // Index coverage by symbol -> timeframe -> {minTimestamp, maxTimestamp}
  const candleCoverageBySymbol = candleCoverageBySymbolAndTimeframe.reduce(
    (coverageIndex, coverageRow) => {
      const { symbol, timeframe } = coverageRow;

      if (!coverageIndex.has(symbol)) {
        coverageIndex.set(symbol, {} as CandleRangeByTimeframe);
      }

      const coverageByTimeframe = coverageIndex.get(symbol)!;

      coverageByTimeframe[timeframe] = {
        minTimestamp: coverageRow._min.timestamp,
        maxTimestamp: coverageRow._max.timestamp,
      };

      return coverageIndex;
    },
    new Map<string, CandleRangeByTimeframe>()
  );

  /*
  Example (candleCoverageBySymbol):
  Map {
    "BTCUSDT" => {
      "1m": { minTimestamp: 1704067200000, maxTimestamp: 1735689600000 },
      "5m": { minTimestamp: 1704067200000, maxTimestamp: 1735689600000 }
    },
    "AAPL" => {
      "1d": { minTimestamp: 1262304000000, maxTimestamp: 1735603200000 }
    }
  }
  */

  // Load symbols and attach candle coverage
  const symbolsInCatalog = await prisma.symbol.findMany({
    orderBy: { symbol: "asc" },
  });

  /*
  Example (symbolsInCatalog):
  [
    {
      id: "clx_01...",
      symbol: "AAPL",
      name: "Apple Inc.",
      baseAsset: "AAPL",
      quoteAsset: "USD",
      sector: "Technology",
      industry: "Consumer Electronics",
      exchange: "NASDAQ",
      priceStep: 0.01,
      quantityStep: 0.0001,
      minQuantity: 0.0001,
      ...other columns
    },
    {
      id: "clx_02...",
      symbol: "BTCUSDT",
      name: null,
      baseAsset: "BTC",
      quoteAsset: "USDT",
      sector: null,
      industry: null,
      exchange: "BINANCE",
      priceStep: 0.1,
      quantityStep: 0.000001,
      minQuantity: 0.00001,
      ...other columns
    }
  ]
  */

  return symbolsInCatalog.map((symbolRow) => {
    const displayName = symbolRow.name ?? symbolRow.symbol;

    return {
      symbol: symbolRow.symbol,
      name: displayName,
      base_asset: symbolRow.baseAsset,
      quote_asset: symbolRow.quoteAsset,
      sector: symbolRow.sector ?? "Unknown",
      industry: symbolRow.industry ?? "Unknown",
      exchange: symbolRow.exchange ?? "Unknown",
      price_step: symbolRow.priceStep,
      quantity_step: symbolRow.quantityStep,
      min_quantity: symbolRow.minQuantity,
      candle_coverage_by_symbol: candleCoverageBySymbol.get(symbolRow.symbol) ?? {},
    };
  });

  /*
  Example (final return value of getAvailableSymbols()):
  [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      base_asset: "AAPL",
      quote_asset: "USD",
      sector: "Technology",
      industry: "Consumer Electronics",
      exchange: "NASDAQ",
      price_step: 0.01,
      quantity_step: 0.0001,
      min_quantity: 0.0001,
      timeframes: {
        "1d": { minTimestamp: 1262304000000, maxTimestamp: 1735603200000 }
      }
    },
    {
      symbol: "BTCUSDT",
      name: "BTCUSDT",
      base_asset: "BTC",
      quote_asset: "USDT",
      sector: "Unknown",
      industry: "Unknown",
      exchange: "BINANCE",
      price_step: 0.1,
      quantity_step: 0.000001,
      min_quantity: 0.00001,
      timeframes: {
        "1m": { minTimestamp: 1704067200000, maxTimestamp: 1735689600000 },
        "5m": { minTimestamp: 1704067200000, maxTimestamp: 1735689600000 }
      }
    }
  ]
  */
}
