import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO } from "date-fns"

async function requireAdmin(req: NextRequest) {
  const sessionId = req.cookies.get("session_id")?.value
  if (!sessionId) return null

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) return null
  if (session.user.role !== "ADMIN") return null

  return session.user
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    // Filtra por mês: 
    const month = searchParams.get("month") // yyyy-MM
    // Filtra por dia específico dentro do mês: 
    const day = searchParams.get("day")     // yyyy-MM-dd

    if (!month) {
      return NextResponse.json({ message: "Parâmetro 'month' obrigatório" }, { status: 400 })
    }

    const monthStart = startOfMonth(parseISO(`${month}-01`))
    const monthEnd = endOfMonth(monthStart)

    const dateFilter = day
      ? { gte: startOfDay(parseISO(day)), lte: endOfDay(parseISO(day)) }
      : { gte: monthStart, lte: monthEnd }

    const [orders, scheduledOrders] = await Promise.all([
      prisma.order.findMany({
        where: { date: dateFilter },
        include: {
          user: { include: { company: true } },
          items: { include: { item: true, subcategory: true } },
        },
        orderBy: { date: "asc" },
      }),
      prisma.scheduledOrder.findMany({
        where: { date: dateFilter },
        include: {
          user: { include: { company: true } },
          items: { include: { item: true, subcategory: true } },
        },
        orderBy: { date: "asc" },
      }),
    ])

    
    const daysWithOrders = Array.from(
      new Set([
        ...orders.map(o => format(o.date, "yyyy-MM-dd")),
        ...scheduledOrders.map(s => format(s.date, "yyyy-MM-dd")),
      ])
    ).sort()

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        kind: "normal" as const,
        date: format(o.date, "yyyy-MM-dd"),
        mealType: o.mealType,
        companyName: o.user.company.socialName,
        cnpj: o.user.company.cnpj,
        reviewedAt: o.reviewedAt ? o.reviewedAt.toISOString() : null,
        items: o.items.map(i => ({
          itemName: i.item.name,
          subcategoryName: i.subcategory?.name ?? null,
          quantity: i.quantity,
        })),
      })),
      scheduledOrders: scheduledOrders.map(s => ({
        id: s.id,
        kind: "scheduled" as const,
        date: format(s.date, "yyyy-MM-dd"),
        companyName: s.user.company.socialName,
        cnpj: s.user.company.cnpj,
        reviewedAt: s.reviewedAt ? s.reviewedAt.toISOString() : null,
        items: s.items.map(i => ({
          itemName: i.item.name,
          subcategoryName: i.subcategory?.name ?? null,
          quantity: i.quantity,
        })),
      })),
      daysWithOrders,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}
