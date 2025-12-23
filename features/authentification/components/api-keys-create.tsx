// features/authentification/components/api-keys-list.tsx
"use client";

import * as React from "react"
import { apiKey, useSession } from "@/features/authentification/client/authClient"

// UI components
import { Button } from "@/shared/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ApiKeysCreate() {
  const { data: session } = useSession()
  const [name, setName] = React.useState("")
  const [newKeyPlain, setNewKeyPlain] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Create a new API key
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNewKeyPlain(null)
    setLoading(true)

    try {
      const { data, error } = await apiKey.create({ name })

      if (error) {
        setError(error.message ?? "Failed to create API key")
        return
      }

      setNewKeyPlain((data as any).key)
      setName("")
    } catch {
      setError("Unexpected error while creating API key.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Creé une nouvelle clé API</CardTitle>
        <CardDescription>Génère une nouvelle clé API pour accéder à la plateforme.</CardDescription>
      </CardHeader>
      <CardContent>
        {(session?.user as any)?.role === "demo" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action non autorisée</AlertTitle>
            <AlertDescription>
              Le compte de démonstration ne peut pas créer de clés API.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez un nom pour votre clé API"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Création en cours..." : "Créer une clé API"}
            </Button>
          </form>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {newKeyPlain && (
          < div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="bg-white p-2 rounded text-sm break-all">{newKeyPlain}</pre>
            <p className="text-xs text-gray-600 mt-2">
              Veuillez copier cette clé maintenant. Vous ne pourrez plus la voir par la suite !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}