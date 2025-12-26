/*
  Warnings:

  - You are about to drop the column `results` on the `backtest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "backtest" DROP COLUMN "results";

-- CreateTable
CREATE TABLE "backtest_result" (
    "id" TEXT NOT NULL,
    "backtestId" TEXT NOT NULL,
    "totalReturn" DOUBLE PRECISION NOT NULL,
    "finalEquity" DOUBLE PRECISION NOT NULL,
    "totalFees" DOUBLE PRECISION NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "sharpeRatio" DOUBLE PRECISION,
    "trades" JSONB NOT NULL,
    "equityCurve" JSONB NOT NULL,
    "logs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backtest_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backtest_result_backtestId_key" ON "backtest_result"("backtestId");

-- AddForeignKey
ALTER TABLE "backtest_result" ADD CONSTRAINT "backtest_result_backtestId_fkey" FOREIGN KEY ("backtestId") REFERENCES "backtest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
