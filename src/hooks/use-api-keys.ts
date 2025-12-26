"use client"

import * as React from "react"
import { apiKey } from "@/lib/auth-client"

type ApiKeyItem = {
  id: string
  name: string
  createdAt: string | Date
}

type CreateApiKeyResult = {
  key: string
}

export function useApiKeys() {
  // etat de la liste
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([])
  const [loadingList, setLoadingList] = React.useState(true)
  const [listError, setListError] = React.useState<string | null>(null)

  // etat de creation
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [newKeyPlain, setNewKeyPlain] = React.useState<string | null>(null)

  // etat de suppression
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)



  // Charge et recharge la liste des clés API
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
    } 
    catch {
      setListError("Unexpected error while loading API keys.")
    } 
    finally {
      setLoadingList(false)
    }
  }, [])

  // charge la liste au montage et a chaque changement de la fonction refresh
  React.useEffect(() => { refresh() }, [refresh])

  // Crée une nouvelle clé API
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
      // refresh la liste
      await refresh()
      return { ok: true as const, key }
    } 
    catch {
      setCreateError("Unexpected error while creating API key.")
      return { ok: false as const }
    } 
    finally {
      setCreating(false)
    }
  }, [refresh])


  // Supprime le le bloc de la nouveelle clé créée
  const clearNewKey = React.useCallback(() => { setNewKeyPlain(null) }, [])

  // delete une clé API
  const deleteKey = React.useCallback(async (id: string) => {

    setDeleteError(null)
    setDeletingId(id)

    try {
      const { error } = await apiKey.delete({ keyId: id })
      if (error) {
        setDeleteError(error.message ?? "Failed to delete API key")
        return false
      }
      // supprime de la liste locale
      setKeys(prev => prev.filter(k => k.id !== id))
      return true
    } 
    catch {
      setDeleteError("Unexpected error while deleting API key.")
      return false
    } 
    finally {
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
