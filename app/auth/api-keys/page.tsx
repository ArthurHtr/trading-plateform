// app/api-keys/page.tsx
import { ApiKeysClient } from "@/components/api-keys-creation"

export default function ApiKeysPage() {
  return (
    <main className="w-full py-10 px-6 sm:px-10">
      <h1 className="mb-4 text-2xl font-bold">API Keys</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Crée et gère ici les clés API utilisées par ta SDK.
      </p>
      <ApiKeysClient />
    </main>
  )
}
