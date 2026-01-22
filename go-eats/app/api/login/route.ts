import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { addDays } from "date-fns"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Credenciais inválidas" },
        { status: 404 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Credenciais inválidas" },
        { status: 401 }
      )
    }

    // limpa sessões expiradas
    await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    })

    
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          companyId: user.companyId,
        },
      },
      { status: 200 }
    )

    response.cookies.set({
      name: "session_id",
      value: session.id,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
