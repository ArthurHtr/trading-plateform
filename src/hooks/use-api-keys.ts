"use client"

import * as React from "react"
import { apiKey } from "@/lib/auth-client"

export type ApiKeyItem = {
  id: string
  name: string
  createdAt: string | Date
}

type CreateApiKeyResult = {
  key: string
}

export function useApiKeys() {
  // List State
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([])
  const [loadingList, setLoadingList] = React.useState(true)
  const [listError, setListError] = React.useState<string | null>(null)

  // Create State
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [newKeyPlain, setNewKeyPlain] = React.useState<string | null>(null)

  // Delete State
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setListError(null)
    setLoadingList(true)
    try {
      const { data, error } = await apiKey.list()
      if (error) {
        setListError(error.message ?? "Failed to load API keys")
        return
      }
      setKeys((data ?? []) as ApiKeyItem[])
    } catch {
      setListError("Unexpected error while loading API keys.")
    } finally {
      setLoadingList(false)
    }
  }, [])

  // Initial fetch
  React.useEffect(() => {
    refresh()
  }, [refresh])

  const createKey = React.useCallback(async (name: string) => {
    setCreateError(null)
    setNewKeyPlain(null)

    const trimmed = name.trim()
    if (!trimmed) {
      setCreateError("Veuillez entrer un nom de clé API.")
      return { ok: false as const }
    }

    setCreating(true)
    try {
      const { data, error } = await apiKey.create({ name: trimmed })

      if (error) {
        setCreateError(error.message ?? "Failed to create API key")
        return { ok: false as const }
      }

      const key = (data as CreateApiKeyResult | null | undefined)?.key
      if (!key) {
        setCreateError("API key created but not returned by the server.")
        return { ok: false as const }
      }

      setNewKeyPlain(key)
      // Refresh the list after successful creation
      await refresh()
      return { ok: true as const, key }
    } catch {
      setCreateError("Unexpected error while creating API key.")
      return { ok: false as const }
    } finally {
      setCreating(false)
    }
  }, [refresh])

  const clearNewKey = React.useCallback(() => {
    setNewKeyPlain(null)
  }, [])

  const deleteKey = React.useCallback(async (id: string) => {
    setDeleteError(null)
    setDeletingId(id)
    try {
      const { error } = await apiKey.delete({ keyId: id })
      if (error) {
        setDeleteError(error.message ?? "Failed to delete API key")
        return false
      }
      // Optimistic update or refresh
      setKeys(prev => prev.filter(k => k.id !== id))
      return true
    } catch {
      setDeleteError("Unexpected error while deleting API key.")
      return false
    } finally {
      setDeletingId(prev => (prev === id ? null : prev))
    }
  }, [])

  return {
    // List
    keys,
    loadingList,
    listError,
    refresh,

    // Create
    createKey,
    creating,
    createError,
    newKeyPlain,
    clearNewKey,

    // Delete
    deleteKey,
    deletingId,
    deleteError
  }
}
