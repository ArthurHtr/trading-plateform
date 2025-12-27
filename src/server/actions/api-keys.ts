"use server";

import { getUserApiKeys } from "@/server/data/api-keys";
import { requireSession } from "@/server/auth/guard.server";
import { auth } from "@/server/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function fetchUserApiKeysAction() {
  const session = await requireSession();
  try {
    const data = await getUserApiKeys(session.user.id);
    return data;
  } catch (error) {
    console.error("Failed to fetch api keys:", error);
    throw new Error("Failed to fetch api keys");
  }
}

export async function createApiKeyAction(name: string) {
  await requireSession();
  try {
    const result = await auth.api.createApiKey({
        body: { name },
        headers: await headers()
    });
    
    revalidatePath("/api-keys");
    return result;
  } catch (error) {
    console.error("Failed to create api key:", error);
    throw new Error("Failed to create api key");
  }
}

export async function deleteApiKeyAction(keyId: string) {
  await requireSession();
  try {
    await auth.api.deleteApiKey({
        body: { keyId },
        headers: await headers()
    });
    revalidatePath("/api-keys");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete api key:", error);
    throw new Error("Failed to delete api key");
  }
}

export async function updateApiKeyAction(keyId: string, data: { name?: string, enabled?: boolean }) {
    await requireSession();
    try {
        await auth.api.updateApiKey({
            body: { keyId, ...data },
            headers: await headers()
        });
        revalidatePath("/api-keys");
        return { success: true };
    } catch (error) {
        console.error("Failed to update api key:", error);
        throw new Error("Failed to update api key");
    }
}
