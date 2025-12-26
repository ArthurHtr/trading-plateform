import { getSession } from "@/server/auth/guard.server"
import { prisma } from "@/server/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const updatePortfolioSchema = z.object({
  name: z.string().min(1).optional(),
  symbols: z.array(z.string()).optional(),
})

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { id, userId: session.user.id }
  })
  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(portfolio)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params

    const body = await request.json()
    const data = updatePortfolioSchema.parse(body)

    const portfolio = await prisma.portfolio.update({
      where: { id, userId: session.user.id },
      data
    })
    return NextResponse.json(portfolio)
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.portfolio.delete({
    where: { id, userId: session.user.id }
  })
  return NextResponse.json({ success: true })
}
