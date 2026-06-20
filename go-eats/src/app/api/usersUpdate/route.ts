import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const { id, email, role } = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: "ID do usuário não informado" },
        { status: 400 }
      )
    }

    
    const data: { email?: string; role?: "ADMIN" | "USER" } = {}

    if (email !== undefined) data.email = email
    if (role !== undefined) data.role = role

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Nenhum campo para atualizar" },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}