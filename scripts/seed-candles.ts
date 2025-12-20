import { prisma } from "@/lib/prisma";

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

function generateDailyCandlesForSymbol(
  symbol: string,
  startPrice: number,
  startDate: Date,
  endDate: Date,
  volatility: number = 0.015 // Higher volatility for daily
) {
  const candles = [];
  let currentPrice = startPrice;
  let currentTime = new Date(startDate);
  // Set to midnight UTC or local
  currentTime.setHours(0, 0, 0, 0);

  const end = new Date(endDate);

  while (currentTime < end) {
    // Skip weekends
    const day = currentTime.getDay();
    if (day === 0 || day === 6) {
      currentTime.setDate(currentTime.getDate() + 1);
      continue;
    }

    // Generate candle data
    const drift = 0.0002; 
    const change = currentPrice * (drift + volatility * randn_bm());
    const close = currentPrice + change;
    const open = currentPrice; 
    
    const move = Math.abs(close - open);
    const high = Math.max(open, close) + (move * Math.random() * 0.8);
    const low = Math.min(open, close) - (move * Math.random() * 0.8);
    
    const volume = Math.floor(Math.random() * 500000) + 50000;

    candles.push({
      symbol,
      timeframe: "1d",
      timestamp: new Date(currentTime),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume,
    });

    currentPrice = close;
    currentTime.setDate(currentTime.getDate() + 1);
  }

  return candles;
}

async function main() {
  console.log("Fetching symbols...");
  const symbols = await prisma.symbol.findMany();
  console.log(`Found ${symbols.length} symbols.`);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year

  console.log(`Generating 5m candles from ${startDate.toISOString()} to ${endDate.toISOString()}...`);

  let totalCandles = 0;

  for (const sym of symbols) {
    // Determine a reasonable start price
    // Random between 50 and 500
    const startPrice = Math.random() * 450 + 50;
    
    const candles = generateCandlesForSymbol(sym.symbol, startPrice, startDate, endDate);
    
    if (candles.length > 0) {
      // Batch insert in chunks to avoid parameter limit
      const batchSize = 5000;
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize);
        await prisma.candle.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
      
      totalCandles += candles.length;
      process.stdout.write(`.`); // Progress indicator
    }
  }

  console.log(`\nSuccessfully inserted ${totalCandles} 5m candles.`);

  // --- Generate 1d candles for 10 years ---
  const startDateDaily = new Date();
  startDateDaily.setFullYear(startDateDaily.getFullYear() - 10);
  
  console.log(`\nGenerating 1d candles from ${startDateDaily.toISOString()} to ${endDate.toISOString()}...`);
  
  let totalDailyCandles = 0;

  for (const sym of symbols) {
    // Use a different start price or continue from somewhere? 
    // Let's just pick a random one, it's dummy data.
    const startPrice = Math.random() * 450 + 50;
    
    const candles = generateDailyCandlesForSymbol(sym.symbol, startPrice, startDateDaily, endDate);
    
    if (candles.length > 0) {
      const batchSize = 5000;
      for (let i = 0; i < candles.length; i += batchSize) {
        const batch = candles.slice(i, i + batchSize);
        await prisma.candle.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
      totalDailyCandles += candles.length;
      process.stdout.write(`.`); 
    }
  }
  console.log(`\nSuccessfully inserted ${totalDailyCandles} 1d candles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
