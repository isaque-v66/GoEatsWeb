import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatOrderMessage } from "@/src/utils/formatOrder"
import { sendEmail } from "@/src/lib/email"

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "OrderId não enviado" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        company: true,
        items: {
          include: {
            item: true,
            subcategory: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      )
    }

    const message = formatOrderMessage({
      order,
      isScheduled: false,
    })

    await sendEmail({
      subject: `Novo Pedido - ${order.company.socialName}`,
      message,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Erro ao enviar pedido" },
      { status: 500 }
    )
  }
}
