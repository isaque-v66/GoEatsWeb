import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { parseISO, format, startOfDay, endOfDay } from "date-fns"

type PatchPayload = {
  userId: string
  // Nova data para o pedido inteiro (mover o dia). Opcional.
  newDate?: string 
  // Atualizações de quantidade por item do ScheduledOrder. Opcional.
  itemUpdates?: { scheduledOrderItemId: string; quantity: number }[]
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }>}
) {
  try {
    const { id } = await params
    const { userId, newDate, itemUpdates }: PatchPayload = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "userId não informado" }, { status: 400 })
    }

    const scheduledOrder = await prisma.scheduledOrder.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!scheduledOrder || scheduledOrder.userId !== userId) {
      return NextResponse.json({ message: "Pedido especial não encontrado" }, { status: 404 })
    }

    // Mover de data: valida que o usuário não tem outro ScheduledOrder

    if (newDate) {
      const targetDate = parseISO(newDate)

      const conflict = await prisma.scheduledOrder.findFirst({
        where: {
          userId,
          id: { not: id },
          date: { gte: startOfDay(targetDate), lte: endOfDay(targetDate) },
        },
      })

      if (conflict) {
        return NextResponse.json(
          { message: `Já existe um pedido especial em ${format(targetDate, "dd/MM/yyyy")}` },
          { status: 409 }
        )
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (itemUpdates?.length) {
        for (const update of itemUpdates) {
          const belongsToOrder = scheduledOrder.items.some(
            i => i.id === update.scheduledOrderItemId
          )
          if (!belongsToOrder) continue

          if (update.quantity <= 0) {
            await tx.scheduledOrderItem.delete({
              where: { id: update.scheduledOrderItemId },
            })
          } else {
            await tx.scheduledOrderItem.update({
              where: { id: update.scheduledOrderItemId },
              data: { quantity: update.quantity },
            })
          }
        }
      }

      const remainingItems = await tx.scheduledOrderItem.count({
        where: { scheduledOrderId: id },
      })

      
      if (remainingItems === 0) {
        await tx.scheduledOrder.delete({ where: { id } })
        return null
      }

      if (newDate) {
        const targetDate = parseISO(newDate)
        return tx.scheduledOrder.update({
          where: { id },
          data: { date: targetDate, startDate: targetDate, endDate: targetDate },
        })
      }

      return tx.scheduledOrder.findUnique({ where: { id } })
    })

    if (!result) {
      return NextResponse.json({ message: "Pedido removido (sem itens restantes)", deleted: true })
    }

    return NextResponse.json({ message: "Pedido atualizado com sucesso" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
