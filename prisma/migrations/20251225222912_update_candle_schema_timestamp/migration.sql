/*
  Warnings:

  - The primary key for the `candle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `date` to the `candle` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `timestamp` on the `candle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "candle" DROP CONSTRAINT "candle_pkey",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" INTEGER NOT NULL,
ADD CONSTRAINT "candle_pkey" PRIMARY KEY ("symbol", "timeframe", "timestamp");
