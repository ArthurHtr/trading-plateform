import { prisma } from "@/server/db";

export async function getUserApiKeys(userId: string) {
  return await prisma.apikey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getApiKeyById(keyId: string) {
  return await prisma.apikey.findUnique({
    where: { id: keyId }
  });
}
