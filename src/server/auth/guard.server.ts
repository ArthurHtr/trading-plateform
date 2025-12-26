import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/sign-in");
  }
  return session;
}

export async function requireNonDemo() {
  const session = await requireSession();
  if ((session.user as any).role === "demo") {
    redirect("/");
  }
  return session;
}

export async function verifyApiKey() {
  const headerList = await headers();
  const apiKey = headerList.get("x-api-key");
  
  if (!apiKey) return false;

  try {
    const result = await auth.api.verifyApiKey({
        body: { key: apiKey },
    })

    if (!result || (result as any).error) {
        return false
    }

    return true
  } catch (error) {
    return false
  }
}
