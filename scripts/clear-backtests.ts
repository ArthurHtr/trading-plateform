
import { prisma } from "@/server/db";

async function main() {
  await prisma.backtest.deleteMany({});
  console.log("All backtests deleted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
