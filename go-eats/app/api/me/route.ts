import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          company: true,
        },
      },
    },
  })

  // sessão inválida ou expirada
  if (!session || session.expiresAt < new Date()) {
    cookieStore.delete("session_id")

    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }

    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.company.socialName,
    },
  })
}
