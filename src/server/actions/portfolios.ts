"use server";

import { getSession } from "@/server/auth/guard.server";
import { createPortfolio, getUserPortfolios, updatePortfolio, deletePortfolio, getPortfolioById } from "@/server/data/portfolios";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createPortfolioSchema = z.object({
  name: z.string().min(1),
  symbols: z.array(z.string()),
});

const updatePortfolioSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  symbols: z.array(z.string()),
});

export async function createPortfolioAction(data: z.infer<typeof createPortfolioSchema>) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const validatedData = createPortfolioSchema.parse(data);

  const portfolio = await createPortfolio(session.user.id, validatedData.name, validatedData.symbols);
  
  revalidatePath("/portfolios");

  return portfolio;
}

export async function fetchUserPortfoliosAction() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return await getUserPortfolios(session.user.id);
}

export async function updatePortfolioAction(data: z.infer<typeof updatePortfolioSchema>) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const validatedData = updatePortfolioSchema.parse(data);

  // Verify ownership
  const existingPortfolio = await getPortfolioById(validatedData.id);
  if (!existingPortfolio || existingPortfolio.userId !== session.user.id) {
    throw new Error("Unauthorized or portfolio not found");
  }

  const portfolio = await updatePortfolio(validatedData.id, validatedData.name, validatedData.symbols);
  revalidatePath("/portfolios");
  return portfolio;
}

export async function deletePortfolioAction(portfolioId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const existingPortfolio = await getPortfolioById(portfolioId);
  if (!existingPortfolio || existingPortfolio.userId !== session.user.id) {
    throw new Error("Unauthorized or portfolio not found");
  }

  await deletePortfolio(portfolioId);
  revalidatePath("/portfolios");
  return { success: true };
}
