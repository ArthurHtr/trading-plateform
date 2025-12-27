import { requireSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { notFound } from "next/navigation"
import { PortfolioEditForm } from "@/components/portfolios/portfolio-edit-form"
import { getAvailableSymbols } from "@/server/data/symbols"

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  const { id } = await params

  const [portfolio, availableSymbols] = await Promise.all([
    prisma.portfolio.findUnique({
      where: { id, userId: session.user.id }
    }),
    getAvailableSymbols()
  ])

  if (!portfolio) notFound()

  return <PortfolioEditForm portfolio={portfolio} initialSymbols={availableSymbols} />
}
