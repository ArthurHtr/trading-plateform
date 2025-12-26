/*
  Warnings:

  - You are about to drop the column `maxDrawdown` on the `backtest_result` table. All the data in the column will be lost.
  - You are about to drop the column `sharpeRatio` on the `backtest_result` table. All the data in the column will be lost.
  - You are about to drop the column `winRate` on the `backtest_result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "backtest" ADD COLUMN     "portfolioId" TEXT;

-- AlterTable
ALTER TABLE "backtest_result" DROP COLUMN "maxDrawdown",
DROP COLUMN "sharpeRatio",
DROP COLUMN "winRate";

-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbols" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_userId_idx" ON "portfolio"("userId");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest" ADD CONSTRAINT "backtest_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
