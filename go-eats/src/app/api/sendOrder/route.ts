import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsApp } from "@/src/lib/whatsapp"
import { formatOrderMessage } from "@/src/utils/formatOrder"
import { OrderFromDB } from "@/src/types/order-db.types"
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
        items: {
          include: {
            item: true,
            subcategory: true,
          },
        },
      },
    }) as OrderFromDB

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      )
    }

    const message = formatOrderMessage(order)

    await sendEmail(message)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Erro ao enviar pedido" },
      { status: 500 }
    )
  }
}