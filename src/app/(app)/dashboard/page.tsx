import { requireSession } from "@/server/auth/guard.server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Key, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const session = await requireSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome {session.user.name}
        </h1>
        <p className="text-xl text-muted-foreground">
          Ready to start building and testing your trading strategies?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl w-full">
        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4">
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Create a Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                Select assets and build your first portfolio to start backtesting strategies.
              </p>
            </div>
            <Button asChild className="w-full mt-2" variant="outline">
              <Link href="/portfolios/new">
                Create Portfolio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4">
            <div className="p-3 w-fit rounded-lg bg-primary/10 text-primary">
              <Key className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Generate API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Create API keys to connect your external trading algorithms securely.
              </p>
            </div>
            <Button asChild className="w-full mt-2" variant="outline">
              <Link href="/api-keys">
                Manage Keys <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
