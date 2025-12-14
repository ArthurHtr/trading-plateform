import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateGBM(
  startPrice: number,
  days: number,
  drift: number = 0.0005,
  volatility: number = 0.02
) {
  const prices = [startPrice];
  for (let i = 1; i < days; i++) {
    const shock =
      volatility *
      Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(2 * Math.PI * Math.random());
    const change = Math.exp(drift + shock);
    prices.push(prices[i - 1] * change);
  }
  return prices;
}

async function main() {
  console.log("Seeding market data...");

  // Clear existing candles to avoid duplicates/conflicts during re-seed
  await prisma.candle.deleteMany({});
  console.log("Cleared existing candles.");

  const symbols = ["AAPL", "NFLX", "GOOGL", "TSLA", "BTC-USD", "ETH-USD", "SOL-USD", "MSFT", "AMZN", "NVDA", "META", "AMD", "SPY", "QQQ", "EUR-USD"];
  const baseStartDate = new Date("2020-01-01");

  // Define configurations for different timeframes
  const configs = [
    { timeframe: "1w", days: 365 * 5, stepsPerDay: 1/7 }, // 5 years of weekly data
    { timeframe: "1d", days: 365 * 5, stepsPerDay: 1 }, // 5 years of daily data
    { timeframe: "4h", days: 365, stepsPerDay: 6 }, // 1 year of 4h data
    { timeframe: "1h", days: 90, stepsPerDay: 24 }, // 90 days of hourly data
    { timeframe: "15m", days: 30, stepsPerDay: 24 * 4 }, // 30 days of 15m data
    { timeframe: "5m", days: 7, stepsPerDay: 24 * 12 }, // 7 days of 5m data
  ];

  for (const symbol of symbols) {
    console.log(`Generating data for ${symbol}...`);
    const startPrice = 100 + Math.random() * 900;

    for (const config of configs) {
      const totalSteps = config.days * config.stepsPerDay;
      // Adjust drift/volatility for smaller timeframes roughly
      const drift = 0.0005 / config.stepsPerDay; 
      const volatility = 0.02 / Math.sqrt(config.stepsPerDay);

      const closes = generateGBM(startPrice, totalSteps, drift, volatility);
      
      const candles = closes.map((close, index) => {
        const date = new Date(baseStartDate);
        // Add time based on index and timeframe
        // 1d -> add days
        // 1h -> add hours
        // 15m -> add minutes
        if (config.timeframe === "1w") {
            date.setDate(date.getDate() + (index * 7));
        } else if (config.timeframe === "1d") {
            date.setDate(date.getDate() + index);
        } else if (config.timeframe === "4h") {
            date.setHours(date.getHours() + (index * 4));
        } else if (config.timeframe === "1h") {
            date.setHours(date.getHours() + index);
        } else if (config.timeframe === "15m") {
            date.setMinutes(date.getMinutes() + (index * 15));
        } else if (config.timeframe === "5m") {
            date.setMinutes(date.getMinutes() + (index * 5));
        }

        // Generate OHLC from Close
        const barVol = volatility; 
        const open = close * (1 + (Math.random() - 0.5) * barVol);
        const high = Math.max(open, close) * (1 + Math.random() * barVol * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * barVol * 0.5);
        const volume = Math.floor(1000000 / config.stepsPerDay + Math.random() * 500000);

        return {
          symbol,
          timeframe: config.timeframe,
          timestamp: date,
          open,
          high,
          low,
          close,
          volume,
        };
      });

      console.log(`Inserting ${candles.length} candles (${config.timeframe}) for ${symbol}...`);
      
      // Insert in chunks to avoid parameter limit issues
      const chunkSize = 1000;
      for (let i = 0; i < candles.length; i += chunkSize) {
          await prisma.candle.createMany({
            data: candles.slice(i, i + chunkSize),
            skipDuplicates: true,
          });
      }
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
