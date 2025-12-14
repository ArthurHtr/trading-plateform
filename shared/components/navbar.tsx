"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  authClient,
  useSession,
} from "@/features/authentification/client/authClient"
import { Button } from "@/shared/components/ui/button"
import { 
  Key, 
  LogOut, 
  LineChart,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  async function handleLogout() {
    await authClient.signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/backtests", label: "Backtests", icon: LineChart },
    { href: "/backtests/create", label: "New Backtest", icon: Plus },
    { href: "/auth/api-keys", label: "API Keys", icon: Key },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 sm:px-8 mx-auto">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-lg">
              Trading Platform
            </span>
          </Link>
          {session?.user && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href || pathname?.startsWith(item.href + "/")
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
               <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end text-xs">
                    <span className="font-medium">{session.user.name}</span>
                    <span className="text-muted-foreground">{session.user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
