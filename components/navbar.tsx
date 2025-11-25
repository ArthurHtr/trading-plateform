// components/navbar.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  async function handleLogout() {
    await authClient.signOut()
    router.push("/") // après logout, retour accueil
  }

  return (
    <nav className="w-full border-b bg-background">
      <div className="flex h-14 w-full items-center justify-between px-6 sm:px-10">
        {/* Logo / nom du site */}
        <Link href="/" className="text-base font-semibold sm:text-lg">
          Trading Platform
        </Link>

        {/* Zone droite */}
        <div className="flex items-center gap-3">
          {isPending ? null : session?.user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/api-keys">API Keys</Link>
              </Button>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Connecté en tant que{" "}
                <span className="font-medium">
                  {session.user.name ?? session.user.email}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

