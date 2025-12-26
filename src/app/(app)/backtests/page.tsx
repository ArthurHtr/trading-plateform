import Link from "next/link"
import { Plus, FolderOpen } from "lucide-react"

import { requireSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BacktestCard } from "@/components/backtests/backtest-card"

export default async function BacktestsListPage() {
  const session = await requireSession()

  const backtests = await prisma.backtest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const hasBacktests = backtests.length > 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Backtests</h1>
            <Badge variant="secondary" className="font-mono">
              {backtests.length} {backtests.length === 1 ? "item" : "items"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage and view your backtest results.
          </p>
        </div>
      </div>

      {/* Content */}
      {hasBacktests ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {backtests.map((backtest) => (
            <BacktestCard key={backtest.id} backtest={backtest} />
          ))}
        </div>
      ) : (
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <div className="bg-muted/20 border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-base font-semibold leading-tight">No backtests yet</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">
              Create your first backtest to start tracking results and performance.
            </p>
          </div>

          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-muted/50 p-4">
              <FolderOpen className="h-9 w-9 text-muted-foreground/70" />
            </div>

            <p className="text-sm text-muted-foreground max-w-sm">
              You don&apos;t have any backtests. Click below to create one.
            </p>

            <Button asChild variant="outline" className="mt-5">
              <Link href="/backtests/create">
                <Plus className="mr-2 h-4 w-4" />
                Create your first backtest
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
