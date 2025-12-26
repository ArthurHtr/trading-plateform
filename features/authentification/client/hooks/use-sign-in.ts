// features/authentification/client/hooks/use-sign-in.ts
"use client"

import * as React from "react"
import { signIn } from "@/features/authentification/client/auth.client"

type SignInArgs = {
  email: string
  password: string
}

export function useSignIn() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const signInWithEmail = React.useCallback(async ({ email, password }: SignInArgs) => {
    setErrorMessage(null)

    const e = email.trim()
    if (!e) {
      setErrorMessage("Email is required.")
      return { ok: false as const }
    }
    if (!password) {
      setErrorMessage("Password is required.")
      return { ok: false as const }
    }

    setIsSubmitting(true)
    try {
      const { error } = await signIn.email({ email: e, password })

      if (error) {
        if ((error as any).status === 403) {
          setErrorMessage("Veuillez vérifier votre email avant de vous connecter.")
        } else {
          setErrorMessage((error as any).message ?? "Failed to login.")
        }
        return { ok: false as const }
      }

      return { ok: true as const }
    } catch {
      setErrorMessage("Unexpected error while logging in.")
      return { ok: false as const }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { signInWithEmail, isSubmitting, errorMessage, setErrorMessage }
}
