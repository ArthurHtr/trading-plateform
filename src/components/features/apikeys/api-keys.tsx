"use client"

import * as React from "react"
import { fetchUserApiKeysAction, createApiKeyAction, deleteApiKeyAction } from "@/server/actions/api-keys"

// UI components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import {
  AlertCircle,
  Key,
  Trash2,
  Copy,
  Check,
  Plus,
  Shield,
  Calendar,
  Terminal,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ApiKeyItem = {
  id: string
  name: string | null
  createdAt: Date
}

export function ApiKeys() {
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([])
  const [loadingList, setLoadingList] = React.useState(true)
  const [listError, setListError] = React.useState<string | null>(null)

  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [newKeyPlain, setNewKeyPlain] = React.useState<string | null>(null)

  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const refresh = React.useCallback(async () => {
    setListError(null)
    setLoadingList(true)
    try {
      const data = await fetchUserApiKeysAction()
      setKeys(data)
    } catch (err) {
      setListError("Failed to load API keys")
    } finally {
      setLoadingList(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setNewKeyPlain(null)
    
    const trimmed = name.trim()
    if (!trimmed) {
      setCreateError("Please enter a key name.")
      return
    }

    setCreating(true)
    try {
      const res = await createApiKeyAction(trimmed)
      if (res?.key) {
        setNewKeyPlain(res.key)
        setName("")
        await refresh()
      } else {
        setCreateError("Failed to create API key")
      }
    } catch (err) {
      setCreateError("Unexpected error while creating API key.")
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = () => {
    if (!newKeyPlain) return
    navigator.clipboard.writeText(newKeyPlain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearNewKey = () => {
    setNewKeyPlain(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setDeleteError(null)
    try {
      await deleteApiKeyAction(id)
      if (newKeyPlain) clearNewKey()
      await refresh()
    } catch (err) {
      setDeleteError("Failed to delete API key")
    } finally {
      setDeletingId(null)
    }
  }

  const error = createError || listError || deleteError

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Left column: Create key */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 px-6 py-5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Plus className="h-4 w-4 text-primary" />
              </div>

              <div className="space-y-0.5">
                <CardTitle className="text-lg leading-tight">
                  New key
                </CardTitle>
                <CardDescription className="leading-snug">
                  Generate a key to connect your algorithms.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-5">
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-3">
                <label
                  htmlFor="key-name"
                  className="text-sm font-medium leading-snug block"
                >
                  Key name
                </label>

                <Input
                  id="key-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="local_key_01"
                  required
                  disabled={creating}
                  className="bg-background"
                />
              </div>

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Creating...
                  </>
                ) : (
                  <>Generate key</>
                )}
              </Button>
            </form>

            {createError && (
              <Alert variant="destructive" className="mt-5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security note */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Security
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Your API keys grant access to your account. Never share them and store them securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: List & new key display */}
      <div className="lg:col-span-2 space-y-6">
        {/* New key success display */}
        {newKeyPlain && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10 overflow-hidden">
              <CardHeader className="px-6 py-5 space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <CardTitle className="text-base leading-tight">
                    API key created successfully
                  </CardTitle>
                </div>

                <CardDescription className="text-green-600/80 dark:text-green-500/80 leading-snug">
                  Copy this key now. For security reasons, it will never be shown again.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-muted-foreground/50" />
                    </div>

                    <code className="flex h-10 w-full items-center rounded-md border border-green-200 dark:border-green-900 bg-white dark:bg-black/20 px-3 pl-9 text-sm font-mono text-foreground shadow-sm overflow-hidden">
                      <span className="truncate">{newKeyPlain}</span>
                    </code>
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                    className={cn(
                      "shrink-0 transition-all",
                      copied &&
                        "border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20"
                    )}
                    title={copied ? "Copied" : "Copy"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={clearNewKey}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    title="Close"
                  >
                    <span className="text-lg">×</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Keys list */}
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/20 border-b px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-lg leading-tight flex items-center gap-2">
                  <span className="truncate">Active keys</span>
                </CardTitle>

                <CardDescription className="mt-1 leading-snug">
                  Manage access for your third-party applications.
                </CardDescription>
              </div>

              <Badge variant="secondary" className="font-mono shrink-0">
                {keys.length} {keys.length === 1 ? "key" : "keys"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Error banner */}
            {error && !createError && (
              <div className="px-6 pt-5">
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              </div>
            )}

            {/* Loading */}
            {loadingList ? (
              <div className="px-6 py-10 text-center space-y-3">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading your keys...
                </p>
              </div>
            ) : keys.length === 0 ? (
              /* Empty state */
              <div className="px-6 py-12 text-center">
                <div className="mx-auto w-fit bg-muted/50 p-4 rounded-full mb-4">
                  <Key className="h-8 w-8 text-muted-foreground/60" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold leading-tight">
                  No API keys
                </h3>

                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                  You haven&apos;t created any API keys yet. Use the form to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Left */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-sm truncate">
                          {key.name}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {new Date(key.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex justify-end sm:justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(key.id)}
                        disabled={deletingId === key.id}
                        className="
                          text-muted-foreground
                          hover:text-destructive hover:bg-destructive/10
                          opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                          transition
                        "
                      >
                        {deletingId === key.id ? (
                          <span className="animate-spin mr-2">⏳</span>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Revoke
                      </Button>
                    </div>
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
