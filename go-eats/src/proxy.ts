import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function proxy(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value

  if (!sessionId) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
    },
  })

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  
  if (
    req.nextUrl.pathname.startsWith("/dashboardRegister") &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboardRegister/:path*",
    "/panel/:path*"
  ],
}