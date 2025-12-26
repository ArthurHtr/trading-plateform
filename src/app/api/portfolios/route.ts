import { getSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const createPortfolioSchema = z.object({
  name: z.string().min(1),
  symbols: z.array(z.string()),
})

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const portfolios = await prisma.portfolio.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(portfolios)
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const data = createPortfolioSchema.parse(body)

    const portfolio = await prisma.portfolio.create({
      data: {
        ...data,
        userId: session.user.id
      }
    })
    return NextResponse.json(portfolio)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
