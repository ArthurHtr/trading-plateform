// features/authentification/client/hooks/use-sign-up.ts
"use client"

import * as React from "react"
import { signUp } from "@/features/authentification/client/auth.client"

type SignUpArgs = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export function useSignUp() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const signUpWithEmail = React.useCallback(async (args: SignUpArgs) => {
    setErrorMessage(null)

    const fullName = args.fullName.trim()
    const email = args.email.trim()
    const password = args.password
    const confirmPassword = args.confirmPassword

    if (!fullName) {
      setErrorMessage("Full name is required.")
      return { ok: false as const }
    }

    if (!email) {
      setErrorMessage("Email is required.")
      return { ok: false as const }
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return { ok: false as const }
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return { ok: false as const }
    }

    setIsSubmitting(true)
    try {
      const { error } = await signUp.email({
        name: fullName,
        email,
        password,
      })

      if (error) {
        setErrorMessage((error as any).message ?? "Failed to create account.")
        return { ok: false as const }
      }

      return { ok: true as const }
    } catch {
      setErrorMessage("Unexpected error while creating account.")
      return { ok: false as const }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { signUpWithEmail, isSubmitting, errorMessage, setErrorMessage }
}
