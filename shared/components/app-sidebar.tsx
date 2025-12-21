"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  LineChart,
  Key,
  Settings,
  LogOut,
  PlusCircle,
  ChevronLeft,
  Menu
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useState } from "react"
import { authClient } from "@/features/authentification/client/authClient"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/")
  }

  const routes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/backtests",
      active: pathname === "/backtests",
    },
    {
      label: "New Backtest",
      icon: PlusCircle,
      href: "/backtests/create",
      active: pathname === "/backtests/create",
    },
    {
      label: "API Keys",
      icon: Key,
      href: "/api-keys",
      active: pathname === "/api-keys",
    },
  ]

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className={cn("flex items-center gap-2 font-semibold", collapsed && "justify-center w-full")}>
          <LineChart className="h-6 w-6 text-primary" />
          {!collapsed && <span>TradingPlatform</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? route.label : undefined}
            >
              <route.icon className="h-4 w-4" />
              {!collapsed && <span>{route.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4 space-y-2">
        {session?.user && (
            <div className={cn("flex items-center gap-3 px-2 py-1 mb-2", collapsed && "justify-center px-0")}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0 border border-primary/20">
                    {(session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U").toUpperCase()}
                </div>
                {!collapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{session.user.name || "User"}</span>
                        <span className="text-xs text-muted-foreground truncate" title={session.user.email}>{session.user.email}</span>
                    </div>
                )}
            </div>
        )}

        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
           {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
           <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className={cn("w-full justify-start gap-3", collapsed && "justify-center px-0")}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>
    </div>
  )
}
