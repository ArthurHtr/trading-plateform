// app/api-keys/page.tsx
import { ApiKeys } from "@/components/auth/api-keys"
import { requireNonDemo } from "@/server/auth/guard.server";

export default async function ApiKeysPage() {
  const session = await requireNonDemo();

  return (
    <main className="w-full py-10 px-6 sm:px-10">
      <h1 className="mb-4 text-2xl font-bold">API Keys</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Crée et gère ici les clés API que tu utilises pour accéder à notre plateforme.
      </p>

      <ApiKeys />
    </main>
  )
}
