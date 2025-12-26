"use client"

import * as React from "react"
import { useSession } from "@/features/authentification/client/auth.client"
import { useApiKeys } from "@/features/authentification/client/hooks/use-api-keys"

// UI components
import { Button } from "@/shared/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { 
  AlertCircle, 
  Key, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Shield, 
  Calendar,
  Terminal
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ApiKeys() {
  const { data: session } = useSession()
  const isDemo = (session?.user as any)?.role === "demo"

  const {
    keys,
    loadingList,
    listError,
    createKey,
    creating,
    createError,
    newKeyPlain,
    deleteKey,
    deletingId,
    deleteError
  } = useApiKeys()

  const [name, setName] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await createKey(name)
    if (res.ok) setName("")
  }

  const handleCopy = () => {
    if (newKeyPlain) {
      navigator.clipboard.writeText(newKeyPlain)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const error = createError || listError || deleteError

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Left Column: Create Key */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-primary/10 rounded-md">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Nouvelle clé</CardTitle>
            </div>
            <CardDescription>
              Générez une clé pour connecter vos algorithmes.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {isDemo ? (
              <Alert variant="destructive" className="mb-0">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Mode Démo</AlertTitle>
                <AlertDescription>
                  La création de clés est désactivée.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="key-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Nom de la clé
                  </label>
                  <Input
                    id="key-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Trading Bot V1"
                    required
                    disabled={creating}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Création...
                    </>
                  ) : (
                    <>
                      Générer la clé
                    </>
                  )}
                </Button>
              </form>
            )}

            {createError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security Note */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 shadow-none">
          <CardContent className="pt-6 flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Sécurité</h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Vos clés API donnent accès à votre compte. Ne les partagez jamais et stockez-les en lieu sûr.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: List & New Key Display */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* New Key Success Display */}
        {newKeyPlain && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <CardTitle className="text-base">Clé API créée avec succès</CardTitle>
                </div>
                <CardDescription className="text-green-600/80 dark:text-green-500/80">
                  Copiez cette clé maintenant. Pour des raisons de sécurité, elle ne sera plus jamais affichée.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <code className="flex h-10 w-full rounded-md border border-green-200 dark:border-green-900 bg-white dark:bg-black/20 px-3 py-2 pl-9 text-sm font-mono text-foreground shadow-sm">
                      {newKeyPlain}
                    </code>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                    className={cn(
                      "shrink-0 transition-all",
                      copied && "border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20"
                    )}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Keys List */}
        <Card className="border-muted-foreground/20 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                  Clés actives
                </CardTitle>
                <CardDescription>
                  Gérez l'accès de vos applications tierces.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono">
                {keys.length} {keys.length > 1 ? 'clés' : 'clé'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {error && !createError && (
              <div className="p-4 m-4 bg-destructive/10 text-destructive rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {loadingList ? (
              <div className="p-8 text-center space-y-3">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground">Chargement de vos clés...</p>
              </div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Key className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Aucune clé API</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-4">
                  Vous n'avez pas encore créé de clé API. Utilisez le formulaire pour commencer.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {keys.map((key) => (
                  <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4 group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{key.name}</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                          {key.id.substring(0, 8)}...
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(key.createdAt).toLocaleDateString("fr-FR", {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKey(key.id)}
                      disabled={deletingId === key.id}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    >
                      {deletingId === key.id ? (
                        <span className="animate-spin mr-2">⏳</span>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Révoquer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
