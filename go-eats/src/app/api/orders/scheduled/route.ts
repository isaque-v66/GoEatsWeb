import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { eachDayOfInterval, parseISO, getDay, format } from "date-fns"
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

function formatPeriodLabel(startDate: string, endDate: string) {
  if (startDate === endDate) return format(parseISO(startDate), "dd/MM/yyyy")
  return `${format(parseISO(startDate), "dd/MM/yyyy")} a ${format(parseISO(endDate), "dd/MM/yyyy")}`
}


type EmailBatch = {
  startDate: string
  endDate: string
  itemId: string
  itemName: string
  subcategoryId?: string
  subcategoryName?: string
  quantity: number
}


type ResolvedDayItem = {
  itemId: string
  itemName: string
  subcategoryId?: string
  subcategoryName?: string
  quantity: number
  updateDefault: boolean
}

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId, orders } = await req.json()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    const dayMap = new Map<string, ResolvedDayItem[]>()
    const emailBatches: EmailBatch[] = []
    const allDateKeys = new Set<string>()

    for (const orderItem of orders.items) {
      const startDate = orderItem.startDate ?? orderItem.specificDate
      const endDate = orderItem.endDate ?? orderItem.specificDate

      if (!startDate) continue

      const item = await prisma.item.findFirst({
        where: { name: orderItem.item, mealType: orderItem.mealType },
      })

      if (!item) {
        return NextResponse.json(
          { message: `Item não encontrado: ${orderItem.item}` },
          { status: 404 }
        )
      }

      type SubPayload = {
        name: string
        quantity: number
        updateDefault?: boolean
        startDate?: string
        endDate?: string
      }


      if (!orderItem.subcategories?.length) {
        const days = eachDayOfInterval({
          start: parseISO(startDate),
          end: parseISO(endDate ?? startDate),
        })

        for (const day of days) {
          const dateKey = format(day, "yyyy-MM-dd")
          allDateKeys.add(dateKey)
          if (!dayMap.has(dateKey)) dayMap.set(dateKey, [])

          dayMap.get(dateKey)!.push({
            itemId: item.id,
            itemName: item.name,
            quantity: orderItem.quantity,
            updateDefault: orderItem.updateDefault ?? false,
          })
        }

        emailBatches.push({
          startDate,
          endDate: endDate ?? startDate,
          itemId: item.id,
          itemName: item.name,
          quantity: orderItem.quantity,
        })
        continue
      }

      
      for (const sub of orderItem.subcategories as SubPayload[]) {
        const subStart = sub.startDate ?? startDate
        const subEnd = sub.endDate ?? endDate ?? subStart

        if (!subStart) continue

        const subDays = eachDayOfInterval({
          start: parseISO(subStart),
          end: parseISO(subEnd ?? subStart),
        })

        const subcategory = await prisma.subcategory.findFirst({
          where: { name: sub.name, mealType: orderItem.mealType },
        })

        if (!subcategory) {
          return NextResponse.json(
            { message: `Subcategoria não encontrada: ${sub.name}` },
            { status: 404 }
          )
        }

        for (const day of subDays) {
          const dateKey = format(day, "yyyy-MM-dd")
          allDateKeys.add(dateKey)
          if (!dayMap.has(dateKey)) dayMap.set(dateKey, [])

          dayMap.get(dateKey)!.push({
            itemId: item.id,
            itemName: item.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            quantity: sub.quantity,
            updateDefault: sub.updateDefault ?? false,
          })
        }

        emailBatches.push({
          startDate: subStart,
          endDate: subEnd ?? subStart,
          itemId: item.id,
          itemName: item.name,
          subcategoryId: subcategory.id,
          subcategoryName: subcategory.name,
          quantity: sub.quantity,
        })
      }
    }

    if (allDateKeys.size === 0) {
      return NextResponse.json({ message: "Nenhuma data válida informada" }, { status: 400 })
    }

    
    const existing = await prisma.scheduledOrder.findMany({
      where: {
        userId,
        date: { in: [...allDateKeys].map(d => parseISO(d)) },
      },
      select: { date: true },
    })

    if (existing.length > 0) {
      const conflictDates = existing
        .map(e => format(e.date, "dd/MM/yyyy"))
        .join(", ")
      return NextResponse.json(
        { message: `Já existe pedido agendado para: ${conflictDates}` },
        { status: 409 }
      )
    }

    let totalCreated = 0

  
    for (const [dateKey, dayItems] of dayMap) {
      const date = parseISO(dateKey)
      const scheduleType = getScheduleType(date)

      await prisma.scheduledOrder.create({
        data: {
          userId,
          date,
          startDate: date,
          endDate: date,
          applyAsDefault: dayItems.some(i => i.updateDefault),
          items: {
            create: dayItems.map(i => ({
              itemId: i.itemId,
              subcategoryId: i.subcategoryId,
              quantity: i.quantity,
            })),
          },
        },
      })

      totalCreated++

      const field = quantityField(scheduleType)

      for (const i of dayItems) {
        if (!i.updateDefault) continue

        const userItemConfig = await prisma.userItemConfig.findFirst({
          where: { userId, itemId: i.itemId },
        })
        if (!userItemConfig) continue

        if (i.subcategoryId) {
          await prisma.userSubcategoryConfig.updateMany({
            where: { userItemId: userItemConfig.id, subcategoryId: i.subcategoryId },
            data: { [field]: i.quantity },
          })
        } else {
          await prisma.userItemConfig.update({
            where: { id: userItemConfig.id },
            data: { [field]: i.quantity },
          })
        }
      }
    }

   
    const batchesByPeriod = new Map<string, EmailBatch[]>()
    for (const batch of emailBatches) {
      const periodKey = `${batch.startDate}_${batch.endDate}`
      if (!batchesByPeriod.has(periodKey)) batchesByPeriod.set(periodKey, [])
      batchesByPeriod.get(periodKey)!.push(batch)
    }

    for (const [, batchGroup] of batchesByPeriod) {
      const { startDate, endDate } = batchGroup[0]

      const message = formatScheduledOrderMessage({
        companyName: user.company?.socialName ?? "Empresa",
        period: formatPeriodLabel(startDate, endDate),
        items: batchGroup.map(b => ({
          itemName: b.itemName,
          subcategoryName: b.subcategoryName,
          quantity: b.quantity,
        })),
      })

      await sendEmail({
        subject: `Pedido Especial - ${user.company?.socialName} - ${formatPeriodLabel(startDate, endDate)}`,
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
