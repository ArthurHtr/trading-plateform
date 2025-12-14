-- CreateTable
CREATE TABLE "candle" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "candle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "candle_symbol_timestamp_idx" ON "candle"("symbol", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "candle_symbol_timestamp_key" ON "candle"("symbol", "timestamp");
