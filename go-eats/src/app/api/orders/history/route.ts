import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"
import type { HistoryEntry } from "@/src/features/orders/types/order-history.types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "userId não informado" }, { status: 400 })
    }

    const [orders, scheduledOrders] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { item: true, subcategory: true },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.scheduledOrder.findMany({
        where: { userId },
        include: {
          items: {
            include: { item: true, subcategory: true },
          },
        },
        orderBy: { date: "desc" },
      }),
    ])

    const entries: HistoryEntry[] = [
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

    return NextResponse.json({ entries })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
