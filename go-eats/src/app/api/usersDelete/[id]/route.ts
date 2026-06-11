import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
  params: Promise<{ id: string }>
}

export async function DELETE(req: Request, { params }: Params) {

    
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    await prisma.session.deleteMany({
      where: { userId: id }
    })

    await prisma.userItemConfig.deleteMany({
      where: { userId: id }
    })

    await prisma.order.deleteMany({
      where: { userId: id }
    })

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Usuário deletado com sucesso"
    })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { message: "Erro ao deletar usuário" },
      { status: 500 }
    )
  }
}