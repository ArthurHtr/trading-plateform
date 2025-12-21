"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Mail } from "lucide-react"
import { authClient } from "@/features/authentification/client/authClient"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/auth/sign-up")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-muted">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Vérifiez votre email</CardTitle>
          <CardDescription>
            Un lien de vérification a été envoyé à votre adresse email.
            Veuillez cliquer dessus pour accéder à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Une fois vérifié, vous pourrez accéder à toutes les fonctionnalités.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleLogout}>
              Mauvaise adresse ? Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
