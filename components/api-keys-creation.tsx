// components/api-keys-client.tsx
"use client";

import * as React from "react"
import { apiKey } from "@/lib/auth-client"

// UI components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ApiKeyItem = {
  id: string
  name?: string | null
  prefix?: string | null
  createdAt: string
  expiresAt?: string | null
}

export function ApiKeysClient() {
  
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([])
  const [name, setName] = React.useState("")
  const [newKeyPlain, setNewKeyPlain] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // 1) Charger la liste des clés de l'utilisateur connecté
  async function loadKeys() {
    setError(null)
    const { data, error } = await apiKey.list()

    if (error) {
      setError(error.message ?? "Failed to load API keys")
      return
    }

    const list: ApiKeyItem[] = data.map((k: any) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      createdAt: k.createdAt,
      expiresAt: k.expiresAt,
    }))

    setKeys(list)
  }

  React.useEffect(() => {
    loadKeys()
  }, [])

  // 2) Créer une nouvelle clé
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNewKeyPlain(null)
    setLoading(true)

    // Durée par défaut : 30 jours (en secondes)
    const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 30

    const { data, error } = await apiKey.create({
      name: name || undefined,
      expiresIn: DEFAULT_EXPIRES_IN,
      prefix: name || "key",
      metadata: null
    })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Failed to create API key")
      return
    }

    setNewKeyPlain((data as any).key)

    setName("")
    loadKeys()
  }

  // 3) Supprimer une clé
  async function handleDelete(id: string) {
    setError(null)
    setLoading(true)

    const { error } = await apiKey.delete({ keyId: id })

    setLoading(false)

    if (error) {
      setError(error.message ?? "Failed to delete API key")
      return
    }

    loadKeys()
  }

  return (
    <div className="space-y-6">
      {/* Carte création */}
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle clé</CardTitle>
          <CardDescription>
            Donne un nom (optionnel). La clé expirera automatiquement après 30 jours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              placeholder="Ex: prod-trading-bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </form>

          {newKeyPlain && (
            <div className="mt-2 rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Nouvelle clé API</p>
              <p className="mt-1 break-all font-mono">{newKeyPlain}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Copie cette clé maintenant : elle ne sera plus affichée en
                clair.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Carte liste */}
      <Card>
        <CardHeader>
          <CardTitle>Clés existantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                    {(key.prefix ?? "api-key")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {key.name ?? "Sans nom"} • Créée le{" "}
                    {new Date(key.createdAt).toLocaleString()}
                    {key.expiresAt &&
                      ` • Expire le ${new Date(
                        key.expiresAt,
                      ).toLocaleString()}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(key.id)}
                  disabled={loading}
                >
                  Supprimer
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
