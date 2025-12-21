// components/sign-in-form.tsx
"use client";

import * as React from "react"
import { useRouter } from "next/navigation"

// Auth functions
import { signIn } from "@/features/authentification/client/authClient"

// UI components
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

// SignInForm component
export function SignInForm({ className }: React.ComponentProps<"div">) {

  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const { error } = await signIn.email({ email, password })

      if (error) {
        if (error.status === 403) {
          setErrorMessage("Veuillez vérifier votre email avant de vous connecter.")
        } else {
          setErrorMessage(error.message ?? "Failed to login.")
        }
        return
      }

      router.push("/backtests")
    } catch {
      setErrorMessage("Unexpected error while logging in.")
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              {errorMessage && (
                <Field>
                  <p className="text-sm text-red-500">{errorMessage}</p>
                </Field>
              )}

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/auth/sign-up" className="underline">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
