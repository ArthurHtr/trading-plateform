/*
  Warnings:

  - The primary key for the `candle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `candle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "candle_symbol_timeframe_timestamp_idx";

-- DropIndex
DROP INDEX "candle_symbol_timeframe_timestamp_key";

-- AlterTable
ALTER TABLE "candle" DROP CONSTRAINT "candle_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "candle_pkey" PRIMARY KEY ("symbol", "timeframe", "timestamp");
