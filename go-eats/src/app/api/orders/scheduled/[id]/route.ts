import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { parseISO, format, startOfDay, endOfDay } from "date-fns"
import { sendEmail } from "@/src/lib/email"
import { formatScheduledOrderMessage } from "@/src/utils/formatScheduledOrder"
import { isDateAvailableForMeal } from "@/src/features/dashboard/utils/mealCutoff.rules"

type PatchPayload = {
  userId: string
  // Nova data para o pedido inteiro (mover o dia). Opcional.
  newDate?: string // yyyy-MM-dd
  // Atualizações de quantidade por item do ScheduledOrder. Opcional.
  itemUpdates?: { scheduledOrderItemId: string; quantity: number }[]
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { userId, newDate, itemUpdates }: PatchPayload = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "userId não informado" }, { status: 400 })
    }

    const scheduledOrder = await prisma.scheduledOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true, subcategory: true },
        },
      },
    })

    if (!scheduledOrder || scheduledOrder.userId !== userId) {
      return NextResponse.json({ message: "Pedido especial não encontrado" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    // ── Valida a regra de horário de corte por refeição antes de mover ──
    // Cada item do ScheduledOrder pode ser de um mealType diferente, então
    // a nova data precisa respeitar o corte de TODOS os itens presentes.
    if (newDate) {
      const targetDate = parseISO(newDate)

      for (const item of scheduledOrder.items) {
        const mealType = item.item.mealType
        if (!isDateAvailableForMeal(mealType, targetDate)) {
          return NextResponse.json(
            { message: `${item.item.name}: data indisponível para esta refeição` },
            { status: 422 }
          )
        }
      }

      // Mover de data: valida que o usuário não tem outro ScheduledOrder
      // já ocupando o dia de destino
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

    const updatedItemQuantities = new Map<string, number>()

    await prisma.$transaction(async (tx) => {
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
            updatedItemQuantities.set(update.scheduledOrderItemId, update.quantity)
          }
        }
      }

      const remainingItems = await tx.scheduledOrderItem.count({
        where: { scheduledOrderId: id },
      })

      if (remainingItems === 0) {
        await tx.scheduledOrder.delete({ where: { id } })
        return
      }

      // Sempre reseta reviewedAt ao editar — o admin precisa re-conferir
      // o pedido modificado, independente de ter mudado data ou quantidade.
      await tx.scheduledOrder.update({
        where: { id },
        data: {
          reviewedAt: null,
          ...(newDate && (() => {
            const targetDate = parseISO(newDate)
            return { date: targetDate, startDate: targetDate, endDate: targetDate }
          })()),
        },
      })
    })

    // ── Busca o estado final atualizado para montar o e-mail consolidado ──
    const finalOrder = await prisma.scheduledOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true, subcategory: true },
        },
      },
    })

    // Se o pedido foi removido (zerou todos os itens), não há o que notificar
    if (!finalOrder) {
      return NextResponse.json({ message: "Pedido removido (sem itens restantes)", deleted: true })
    }

    const periodLabel = format(finalOrder.date, "dd/MM/yyyy")

    const message = formatScheduledOrderMessage({
      companyName: user.company.socialName,
      period: periodLabel,
      items: finalOrder.items.map(i => ({
        itemName: i.item.name,
        subcategoryName: i.subcategory?.name,
        quantity: i.quantity,
      })),
    })

    await sendEmail({
      subject: `Pedido Especial Atualizado - ${user.company.socialName} - ${periodLabel}`,
      message,
    })

    return NextResponse.json({ message: "Pedido atualizado com sucesso" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
