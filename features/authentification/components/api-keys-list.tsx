// features/authentification/components/api-keys-list.tsx
"use client";

import * as React from "react"
import { apiKey } from "@/features/authentification/client/authClient"

// UI components
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

export function ApiKeysList() {
  const [keys, setKeys] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Charger les clés de l'utilisateur
  async function loadKeys() {
    setError(null)

    const { data, error } = await apiKey.list()

    if (error) {
      setError(error.message ?? "Failed to load API keys")
      return
    }

    setKeys(data)
  }

  React.useEffect(() => {
    loadKeys()
  }, [])

  // Supprimer une clé
  async function handleDelete(id: string) {
    setError(null)
    setLoading(true)

    const { error } = await apiKey.delete({ keyId: id })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Failed to delete API key")
      return
    }

    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clés existantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune clé pour l&apos;instant.
          </p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-sm">
                  {key.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Créée le{" "}
                  {new Date(key.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(key.id)}
                disabled={loading}
              >
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}


