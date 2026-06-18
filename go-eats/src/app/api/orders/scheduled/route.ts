import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { eachDayOfInterval, parseISO, getDay } from "date-fns"
import { sendEmail } from "@/src/lib/email"
import { formatScheduledOrderMessage } from "@/src/utils/formatScheduledOrder"






type ScheduleType = "WEEKDAY" | "SATURDAY" | "SUNDAY"

function getScheduleType(date: Date): ScheduleType {
  const day = getDay(date)
  if (day === 0) return "SUNDAY"
  if (day === 6) return "SATURDAY"
  return "WEEKDAY"
}

function quantityField(scheduleType: ScheduleType) {
  if (scheduleType === "SATURDAY") return "saturdayQuantity"
  if (scheduleType === "SUNDAY") return "sundayQuantity"
  return "weekdayQuantity"
}

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId, orders } = await req.json()

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            company: true,
        },
    })


    let totalCreated = 0

    for (const orderItem of orders.items) {
      const startDate = orderItem.startDate ?? orderItem.specificDate
      const endDate = orderItem.endDate ?? orderItem.specificDate

      if (!startDate) continue

      const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate ?? startDate),
      })

      // Busca o item uma vez fora do loop de dias
      const item = await prisma.item.findFirst({
        where: {
          name: orderItem.item,
          mealType: orderItem.mealType,
        },
      })

      if (!item) {
        return NextResponse.json(
          { message: `Item não encontrado: ${orderItem.item}` },
          { status: 404 }
        )
      }

      // Busca subcategorias uma vez fora do loop de dias
      type SubPayload = { name: string; quantity: number }
      const subcategoryMap = new Map<string, string>() 

      if (orderItem.subcategories?.length) {
        for (const sub of orderItem.subcategories as SubPayload[]) {
          const found = await prisma.subcategory.findFirst({
            where: { name: sub.name, mealType: orderItem.mealType },
          })
          if (!found) {
            return NextResponse.json(
              { message: `Subcategoria não encontrada: ${sub.name}` },
              { status: 404 }
            )
          }
          subcategoryMap.set(sub.name, found.id)
        }
      }





      const scheduledPeriod =
        startDate === endDate
            ? startDate
            : `${startDate} até ${endDate}`





      for (const day of days) {
        const scheduleType = getScheduleType(day)

        await prisma.scheduledOrder.create({
          data: {
            userId,
            date: day,
            startDate: parseISO(startDate),
            endDate: parseISO(endDate ?? startDate),
            applyAsDefault: orderItem.updateDefault ?? false,
            items: {
              create: orderItem.subcategories?.length
                ? (orderItem.subcategories as SubPayload[]).map(sub => ({
                    quantity: sub.quantity,
                    itemId: item.id,
                    subcategoryId: subcategoryMap.get(sub.name),
                  }))
                : [{ quantity: orderItem.quantity, itemId: item.id }],
            },
          },
        })

        

        totalCreated++

        // Atualiza padrão se solicitado
        if (orderItem.updateDefault) {
          const field = quantityField(scheduleType)

          if (orderItem.subcategories?.length) {
            for (const sub of orderItem.subcategories as SubPayload[]) {
              const subcategoryId = subcategoryMap.get(sub.name)
              const userItemConfig = await prisma.userItemConfig.findFirst({
                where: { userId, itemId: item.id },
              })
              if (!userItemConfig || !subcategoryId) continue

              await prisma.userSubcategoryConfig.updateMany({
                where: { userItemId: userItemConfig.id, subcategoryId },
                data: { [field]: sub.quantity },
              })
            }
          } else {
            await prisma.userItemConfig.updateMany({
              where: { userId, itemId: item.id },
              data: { [field]: orderItem.quantity },
            })
          }
        }
      }
      const message = formatScheduledOrderMessage({
        companyName: user?.company?.socialName ?? "Empresa",
        period: scheduledPeriod,
        itemName: orderItem.item,
        quantity: orderItem.quantity,
        subcategories: orderItem.subcategories,
    })
    
    await sendEmail({
        subject: `Pedido Especial - ${user?.company?.socialName}`,
        message,
    })
    }


    return NextResponse.json({
      message: "Pedidos especiais criados com sucesso",
      count: totalCreated,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}