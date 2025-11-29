// app/api-keys/page.tsx
import { ApiKeysCreate } from "@/features/authentification/components/api-keys-create"
import { ApiKeysList } from "@/features/authentification/components/api-keys-list"

export default function ApiKeysPage() {
  return (
    <main className="w-full py-10 px-6 sm:px-10">
      <h1 className="mb-4 text-2xl font-bold">API Keys</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Crée et gère ici les clés API que tu utilises pour accéder à notre plateforme.
      </p>

      <section className="space-y-6">
        <ApiKeysCreate />
        <ApiKeysList />
      </section>
    </main>
  )
}
