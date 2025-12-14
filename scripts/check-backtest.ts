
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const backtest = await prisma.backtest.findUnique({
    where: { id: "cmj62nrdq0007j996z4hii9a8" },
  });
  console.log(backtest);
}

main();
