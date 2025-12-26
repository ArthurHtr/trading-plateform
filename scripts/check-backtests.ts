
import { prisma } from "@/server/db";

async function main() {
  const count = await prisma.backtest.count();
  console.log(`Backtests count: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
