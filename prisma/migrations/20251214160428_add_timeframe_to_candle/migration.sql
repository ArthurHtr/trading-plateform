/*
  Warnings:

  - A unique constraint covering the columns `[symbol,timeframe,timestamp]` on the table `candle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeframe` to the `candle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "candle_symbol_timestamp_idx";

-- DropIndex
DROP INDEX "candle_symbol_timestamp_key";

-- AlterTable
ALTER TABLE "candle" ADD COLUMN     "timeframe" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "candle_symbol_timeframe_timestamp_idx" ON "candle"("symbol", "timeframe", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "candle_symbol_timeframe_timestamp_key" ON "candle"("symbol", "timeframe", "timestamp");
