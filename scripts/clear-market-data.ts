import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Clearing market data...");

  // Delete all candles first (due to potential foreign key constraints, though usually candles depend on symbols implicitly or explicitly)
  // Actually, in the schema provided earlier, Candle wasn't explicitly shown but usually it's good practice.
  // Let's check schema if needed, but deleteMany on both is safe if order is correct.
  
  console.log("Deleting all candles...");
  const { count: candleCount } = await prisma.candle.deleteMany({});
  console.log(`Deleted ${candleCount} candles.`);

  console.log("Deleting all symbols...");
  const { count: symbolCount } = await prisma.symbol.deleteMany({});
  console.log(`Deleted ${symbolCount} symbols.`);

  console.log("Market data cleared successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
