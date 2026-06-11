import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function PUT(req: Request) {
  try {
    const { id, email, role } = await req.json()

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        email,
        role,
      },
    })

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json(
      { message: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}