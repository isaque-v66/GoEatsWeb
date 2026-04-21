import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const cookiesStored = await cookies()
  const sessionId = cookiesStored.get("session_id")?.value

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } })
  }

  cookiesStored.delete("session_id")

  return new Response(null, { status: 204 })
}
