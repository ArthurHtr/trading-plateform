import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper for Box-Muller transform to get standard normal distribution
function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function generateCandlesForSymbol(
  symbol: string,
  startPrice: number,
  startDate: Date,
  endDate: Date,
  volatility: number = 0.002 // 5-min volatility
) {
  const candles = [];
  let currentPrice = startPrice;
  let currentTime = new Date(startDate);

  // Clone to avoid modifying the original date object in the loop condition if we were using it
  const end = new Date(endDate);

  while (currentTime < end) {
    // Check if weekend (0 = Sunday, 6 = Saturday)
    const day = currentTime.getDay();
    if (day === 0 || day === 6) {
      // Skip to Monday 09:00
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
      continue;
    }

    // Check trading hours (e.g., 09:00 to 17:30)
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    // Simple trading day: 09:00 - 17:30
    if (hour < 9 || (hour >= 17 && minute > 30) || hour > 17) {
      // Move to next valid time
      if (hour >= 17) {
        // Next day 9:00
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(9, 0, 0, 0);
      } else {
        // Same day 9:00
        currentTime.setHours(9, 0, 0, 0);
      }
      continue;
    }

    // Generate candle data
    // Random walk for Close
    const drift = 0.00001; // Slight upward drift
    const change = currentPrice * (drift + volatility * randn_bm());
    const close = currentPrice + change;
    
    // Open is usually previous close, but let's add tiny noise or gaps
    const open = currentPrice; 
    
    // High/Low
    const move = Math.abs(close - open);
    const high = Math.max(open, close) + (move * Math.random() * 0.5);
    const low = Math.min(open, close) - (move * Math.random() * 0.5);
    
    // Volume
    const volume = Math.floor(Math.random() * 10000) + 100;

    candles.push({
      symbol,
      timeframe: "5m",
      timestamp: new Date(currentTime),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume,
    });

    // Update state
    currentPrice = close;
    // Increment time by 5 minutes
    currentTime.setMinutes(currentTime.getMinutes() + 5);
  }

  return candles;
}

async function main() {
  console.log("Fetching symbols...");
  const symbols = await prisma.symbol.findMany();
  console.log(`Found ${symbols.length} symbols.`);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  console.log(`Generating 5m candles from ${startDate.toISOString()} to ${endDate.toISOString()}...`);

  let totalCandles = 0;

  for (const sym of symbols) {
    // Determine a reasonable start price
    // Random between 50 and 500
    const startPrice = Math.random() * 450 + 50;
    
    const candles = generateCandlesForSymbol(sym.symbol, startPrice, startDate, endDate);
    
    if (candles.length > 0) {
      // Batch insert
      // Prisma createMany has a limit, usually safe around 1000-5000 depending on DB
      // We have ~2000 candles per symbol, so one batch per symbol is fine.
      await prisma.candle.createMany({
        data: candles,
        skipDuplicates: true,
      });
      
      totalCandles += candles.length;
      process.stdout.write(`.`); // Progress indicator
    }
  }

  console.log(`\nSuccessfully inserted ${totalCandles} candles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
