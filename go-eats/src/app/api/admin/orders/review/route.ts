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

type ReviewPayload = {
  id: string
  kind: "normal" | "scheduled"
  reviewed: boolean
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { id, kind, reviewed }: ReviewPayload = await req.json()

    const reviewedAt = reviewed ? new Date() : null

    if (kind === "normal") {
      await prisma.order.update({
        where: { id },
        data: { reviewedAt },
      })
    } else {
      await prisma.scheduledOrder.update({
        where: { id },
        data: { reviewedAt },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
