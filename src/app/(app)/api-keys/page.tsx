// app/api-keys/page.tsx
import { ApiKeys } from "@/components/apikeys/api-keys"
import { requireSession } from "@/server/auth/guard.server"

export default async function ApiKeysPage() {

  const session = await requireSession()

  return (
    <main className="w-full py-10 px-6 sm:px-10">
      <h1 className="mb-3 text-2xl font-bold">API Keys</h1>
      <p className="mb-7 text-base text-muted-foreground">
        Crée et gère ici les clés API que tu utilises pour accéder à notre plateforme.
      </p>
      <ApiKeys />
    </main>
  )
}

