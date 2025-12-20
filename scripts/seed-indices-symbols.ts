import { prisma } from "../lib/prisma";

const NASDAQ_100 = [
  "AAPL", 
  "MSFT", 
  "AMZN",
  "NVDA", 
  "GOOGL", 
  "META", 
  "TSLA", 
  "ASML",
  "NFLX",
  "SBUX", 
  "BKNG", 
  "PYPL",
];

async function main() {
  console.log("Seeding NASDAQ 100 symbols...");

  // NASDAQ
  for (const ticker of NASDAQ_100) {
    await prisma.symbol.upsert({
      where: { symbol: ticker },
      update: {
        baseAsset: ticker,
        quoteAsset: "USD",
        priceStep: 0.01,
        quantityStep: 1.0,
        minQuantity: 1.0,
      },
      create: {
        symbol: ticker,
        baseAsset: ticker,
        quoteAsset: "USD",
        priceStep: 0.01,
        quantityStep: 1.0,
        minQuantity: 1.0,
      },
    });
  }
  console.log(`Upserted ${NASDAQ_100.length} NASDAQ symbols.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
