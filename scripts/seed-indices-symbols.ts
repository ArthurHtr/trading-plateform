import { prisma } from "@/lib/prisma";

const NASDAQ_100 = [
  "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "GOOG", "META", "TSLA", "AVGO", "ASML",
  "PEP", "COST", "LIN", "TMUS", "ADBE", "AMD", "CSCO", "NFLX", "QCOM", "INTU",
  "TXN", "AMGN", "HON", "ISRG", "SBUX", "BKNG", "VRTX", "GILD", "MDLZ", "ADI",
  "LRCX", "REGN", "ADP", "PANW", "KLAC", "SNPS", "CDNS", "MU", "MELI", "PYPL",
  "CSX", "MAR", "ORLY", "NXPI", "CTAS", "MNST", "ODFL", "PCAR", "FTNT", "ROST",
  "DXCM", "KDP", "PAYX", "IDXX", "AEP", "LULU", "CHTR", "FAST", "MRVL", "SGEN",
  "CPRT", "EXC", "KHC", "BKR", "ODFL", "VRSK", "XEL", "CSGP", "GEHC", "ON",
  "CDW", "DLTR", "ANSS", "WBD", "FANG", "BIIB", "TTD", "TEAM", "MCHP", "GFS",
  "ZS", "ILMN", "WBA", "SIRI", "EBAY", "ZM", "JD", "LCID", "RIVN", "DDOG"
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
