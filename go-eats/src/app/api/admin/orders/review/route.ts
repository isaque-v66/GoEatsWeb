import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function requireAdmin(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value
  if (!sessionId) return null
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })
  if (!session || session.expiresAt < new Date()) return null
  if (session.user.role !== "ADMIN") return null
  return session.user
}

type SourceRef = { id: string; kind: "normal" | "scheduled" }

type ReviewPayload = {
  sources: SourceRef[]
  reviewed: boolean
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { sources, reviewed }: ReviewPayload = await req.json()

    if (!sources?.length) {
      return NextResponse.json({ message: "Nenhuma origem informada" }, { status: 400 })
    }

    const reviewedAt = reviewed ? new Date() : null

    const normalIds = sources.filter(s => s.kind === "normal").map(s => s.id)
    const scheduledIds = sources.filter(s => s.kind === "scheduled").map(s => s.id)

    await Promise.all([
      normalIds.length
        ? prisma.order.updateMany({ where: { id: { in: normalIds } }, data: { reviewedAt } })
        : Promise.resolve(),
      scheduledIds.length
        ? prisma.scheduledOrder.updateMany({ where: { id: { in: scheduledIds } }, data: { reviewedAt } })
        : Promise.resolve(),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}