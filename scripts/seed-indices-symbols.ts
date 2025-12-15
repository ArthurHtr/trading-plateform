import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

const CAC_40 = [
  "MC.PA",   // LVMH
  "OR.PA",   // L'Oreal
  "RMS.PA",  // Hermes
  "TTE.PA",  // TotalEnergies
  "SAN.PA",  // Sanofi
  "AIR.PA",  // Airbus
  "SU.PA",   // Schneider Electric
  "AI.PA",   // Air Liquide
  "BNP.PA",  // BNP Paribas
  "EL.PA",   // EssilorLuxottica
  "KER.PA",  // Kering
  "DG.PA",   // Vinci
  "SAF.PA",  // Safran
  "CS.PA",   // AXA
  "STLAP.PA",// Stellantis
  "DSY.PA",  // Dassault Systemes
  "BN.PA",   // Danone
  "ACA.PA",  // Credit Agricole
  "STM.PA",  // STMicroelectronics
  "GLE.PA",  // Societe Generale
  "ENGI.PA", // Engie
  "ORA.PA",  // Orange
  "CAP.PA",  // Capgemini
  "LR.PA",   // Legrand
  "VIE.PA",  // Veolia
  "MIC.PA",  // Michelin
  "SGO.PA",  // Saint-Gobain
  "PUB.PA",  // Publicis
  "EN.PA",   // Bouygues
  "MT.PA",   // ArcelorMittal
  "RNO.PA",  // Renault
  "EDEN.PA", // Edenred
  "CA.PA",   // Carrefour
  "TEP.PA",  // Teleperformance
  "ERF.PA",  // Eurofins Scientific
  "WLN.PA",  // Worldline
  "ALO.PA",  // Alstom
  "VIV.PA",  // Vivendi
  "URW.PA",  // Unibail-Rodamco-Westfield
];

async function main() {
  console.log("Seeding NASDAQ 100 and CAC 40 symbols...");

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

  // CAC 40
  for (const ticker of CAC_40) {
    // Extract base asset name without .PA for cleaner baseAsset field if desired, 
    // but keeping ticker is fine. Let's strip .PA for baseAsset.
    const base = ticker.replace(".PA", "");
    
    await prisma.symbol.upsert({
      where: { symbol: ticker },
      update: {
        baseAsset: base,
        quoteAsset: "EUR",
        priceStep: 0.01, // Most EUR stocks trade with 0.01 step
        quantityStep: 1.0,
        minQuantity: 1.0,
      },
      create: {
        symbol: ticker,
        baseAsset: base,
        quoteAsset: "EUR",
        priceStep: 0.01,
        quantityStep: 1.0,
        minQuantity: 1.0,
      },
    });
  }
  console.log(`Upserted ${CAC_40.length} CAC 40 symbols.`);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
