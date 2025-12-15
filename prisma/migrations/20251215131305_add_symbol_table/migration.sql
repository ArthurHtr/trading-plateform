-- CreateTable
CREATE TABLE "symbol" (
    "symbol" TEXT NOT NULL,
    "baseAsset" TEXT NOT NULL,
    "quoteAsset" TEXT NOT NULL,
    "priceStep" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "quantityStep" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "minQuantity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "symbol_pkey" PRIMARY KEY ("symbol")
);
