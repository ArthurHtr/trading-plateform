-- CreateTable
CREATE TABLE "backtest" (
    "id" TEXT NOT NULL,
    "symbols" TEXT[],
    "start" TEXT NOT NULL,
    "end" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "initialCash" DOUBLE PRECISION NOT NULL,
    "feeRate" DOUBLE PRECISION NOT NULL,
    "marginRequirement" DOUBLE PRECISION NOT NULL,
    "seed" INTEGER,
    "strategyName" TEXT NOT NULL,
    "strategyParams" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "results" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backtest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backtest_userId_idx" ON "backtest"("userId");

-- AddForeignKey
ALTER TABLE "backtest" ADD CONSTRAINT "backtest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
