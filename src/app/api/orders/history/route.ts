import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format, startOfDay } from "date-fns"
import type { HistoryEntry } from "@/src/features/orders/types/order-history.types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const pageSize = Math.max(1, Math.min(50, parseInt(searchParams.get("pageSize") ?? "15", 10)))

    if (!userId) {
      return NextResponse.json({ message: "userId não informado" }, { status: 400 })
    }

    const today = startOfDay(new Date())

    const [orders, scheduledOrders, scheduledTotal, normalTotal] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: { include: { item: true, subcategory: true } },
        },
        orderBy: { date: "desc" },
      }),
      
      prisma.scheduledOrder.findMany({
        where: { userId, date: { gte: today } },
        include: {
          items: { include: { item: true, subcategory: true } },
        },
        orderBy: { date: "asc" },
      }),
      prisma.scheduledOrder.count({ where: { userId, date: { gte: today } } }),
      prisma.order.count({ where: { userId } }),
    ])

    const allEntries: HistoryEntry[] = [
      ...orders.map(order => ({
        kind: "normal" as const,
        id: order.id,
        date: format(order.date, "yyyy-MM-dd"),
        mealType: order.mealType,
        items: order.items.map(i => ({
          id: i.id,
          itemName: i.item.name,
          subcategoryName: i.subcategory?.name,
          quantity: i.quantity,
        })),
      })),
      ...scheduledOrders.map(so => ({
        kind: "scheduled" as const,
        id: so.id,
        date: format(so.date, "yyyy-MM-dd"),
        applyAsDefault: so.applyAsDefault,
        items: so.items.map(i => ({
          id: i.id,
          itemName: i.item.name,
          subcategoryName: i.subcategory?.name,
          quantity: i.quantity,
        })),
      })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1))

    const total = allEntries.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const paginatedEntries = allEntries.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({
      entries: paginatedEntries,
      pagination: { page, pageSize, total, totalPages },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
