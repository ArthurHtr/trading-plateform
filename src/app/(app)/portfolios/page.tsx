import Link from "next/link"
import { Plus, Briefcase } from "lucide-react"
import { requireSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default async function PortfoliosListPage() {
  const session = await requireSession()

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { backtests: true } } }
  })

  const hasPortfolios = portfolios.length > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
            <Badge variant="secondary" className="font-mono">
              {portfolios.length} {portfolios.length === 1 ? "item" : "items"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your symbol collections.
          </p>
        </div>
        <Button asChild>
          <Link href="/portfolios/new">
            <Plus className="mr-2 h-4 w-4" />
            New Portfolio
          </Link>
        </Button>
      </div>

      {hasPortfolios ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{portfolio.name}</CardTitle>
                <CardDescription>{portfolio.symbols.length} symbols</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {portfolio.symbols.slice(0, 5).map(s => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                  {portfolio.symbols.length > 5 && (
                    <Badge variant="outline">+{portfolio.symbols.length - 5}</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">
                  {portfolio._count.backtests} backtests
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/portfolios/${portfolio.id}`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-muted-foreground/20 shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No portfolios yet</h3>
            <p className="text-muted-foreground mb-4">Create your first portfolio to start backtesting.</p>
            <Button asChild>
              <Link href="/portfolios/new">Create Portfolio</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
