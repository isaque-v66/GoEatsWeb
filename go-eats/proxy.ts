import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function proxy(req: NextRequest) {



  const sessionId = req.cookies.get("session_id")?.value

  if (!sessionId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
