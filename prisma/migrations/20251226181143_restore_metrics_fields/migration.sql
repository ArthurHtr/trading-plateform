/*
  Warnings:

  - You are about to drop the column `seed` on the `backtest` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `backtest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "backtest" DROP COLUMN "seed",
DROP COLUMN "updatedAt";
