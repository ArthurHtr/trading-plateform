import { requireSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { notFound } from "next/navigation"
import { PortfolioEditForm } from "@/components/portfolios/portfolio-edit-form"

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { id, userId: session.user.id }
  })

  if (!portfolio) notFound()

  return <PortfolioEditForm portfolio={portfolio} />
}
