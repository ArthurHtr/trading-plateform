import { prisma } from "@/server/db";

export async function createPortfolio(userId: string, name: string, symbols: string[]) {
  return await prisma.portfolio.create({
    data: {
      name,
      symbols,
      userId,
    },
  });
}

export async function getUserPortfolios(userId: string) {
  return await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPortfolioById(portfolioId: string) {
  return await prisma.portfolio.findUnique({
    where: { id: portfolioId }
  });
}

export async function updatePortfolio(portfolioId: string, name: string, symbols: string[]) {
  return await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      name,
      symbols,
    },
  });
}

export async function deletePortfolio(portfolioId: string) {
  return await prisma.portfolio.delete({
    where: { id: portfolioId },
  });
}
