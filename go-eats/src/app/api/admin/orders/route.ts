import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfDay, endOfDay, parseISO, getDay, subDays,
} from "date-fns"

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

function getDayType(date: Date): "weekday" | "saturday" | "sunday" {
  const d = getDay(date)
  if (d === 6) return "saturday"
  if (d === 0) return "sunday"
  return "weekday"
}

function getDefaultQty(
  config: { weekdayQuantity?: number | null; saturdayQuantity?: number | null; sundayQuantity?: number | null },
  dayType: "weekday" | "saturday" | "sunday"
): number {
  if (dayType === "saturday") return config.saturdayQuantity ?? 0
  if (dayType === "sunday") return config.sundayQuantity ?? 0
  return config.weekdayQuantity ?? 0
}

// Um "pedido real" individual que compõe a linha (para o checkbox saber o que marcar)
type SourceRef = {
  id: string
  kind: "normal" | "scheduled"
}

// Uma refeição dentro da linha do dia
type MealEntry = {
  mealType: string
  items: { itemName: string; subcategoryName: string | null; quantity: number }[]
}

// Linha final: 1 usuário + 1 dia, com todas as refeições agrupadas
type UserDayRow = {
  userId: string
  date: string
  companyName: string
  cnpj: string
  meals: MealEntry[]
  sources: SourceRef[]       // todos os Order/ScheduledOrder que compõem esta linha
  reviewedAt: string | null  // null se QUALQUER source não revisado; senão a mais recente
  hasProjection: boolean     // true se algum item é projeção (ainda não existe no banco)
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const month = searchParams.get("month")
    const day = searchParams.get("day")
    const page = Math.max(1, Number(searchParams.get("page") ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 15)))

    if (!month) {
      return NextResponse.json({ message: "Parâmetro 'month' obrigatório" }, { status: 400 })
    }

    const monthStart = startOfMonth(parseISO(`${month}-01`))
    const monthEnd = endOfMonth(monthStart)

    const daysToProject = day
      ? [parseISO(day)]
      : eachDayOfInterval({ start: monthStart, end: monthEnd })

    const rangeStart = startOfDay(daysToProject[0])
    const rangeEnd = endOfDay(daysToProject[daysToProject.length - 1])

    const [users, scheduledOrders, normalOrders, fallbackOrders] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        include: {
          company: true,
          itemConfigs: {
            include: { item: true, subcategories: { include: { subcategory: true } } },
          },
        },
      }),
      prisma.scheduledOrder.findMany({
        where: { date: { gte: rangeStart, lte: rangeEnd } },
        include: { items: { include: { item: true, subcategory: true } } },
      }),
      prisma.order.findMany({
        where: { date: { gte: rangeStart, lte: rangeEnd } },
        include: { items: { include: { item: true, subcategory: true } } },
      }),
      prisma.order.findMany({
        where: {
          date: {
            gte: startOfDay(subDays(daysToProject[0], 1)),
            lte: endOfDay(subDays(daysToProject[0], 1)),
          },
        },
        include: { items: { include: { item: true, subcategory: true } } },
      }),
    ])

    const scheduledIdx = new Map<string, typeof scheduledOrders[number]>()
    for (const so of scheduledOrders) {
      scheduledIdx.set(`${so.userId}::${format(so.date, "yyyy-MM-dd")}`, so)
    }

    const normalIdx = new Map<string, typeof normalOrders[number]>()
    for (const o of normalOrders) {
      normalIdx.set(`${o.userId}::${format(o.date, "yyyy-MM-dd")}::${o.mealType}`, o)
    }

    const fallbackIdx = new Map<string, typeof fallbackOrders[number]>()
    for (const o of fallbackOrders) {
      fallbackIdx.set(`${o.userId}::${o.mealType}`, o)
    }

    // ── Constrói 1 linha por usuário+dia ──
    const rows: UserDayRow[] = []
    const daysWithOrders = new Set<string>()

    for (const targetDate of daysToProject) {
      const dateKey = format(targetDate, "yyyy-MM-dd")
      const dayType = getDayType(targetDate)

      for (const user of users) {
        if (!user.itemConfigs.length) continue

        const meals: MealEntry[] = []
        const sources: SourceRef[] = []
        let anyReviewed = true
        let anyExists = false
        let hasProjection = false
        let latestReviewedAt: Date | null = null

        const scheduledOrder = scheduledIdx.get(`${user.id}::${dateKey}`)

        if (scheduledOrder) {
          // ScheduledOrder cobre o dia inteiro — agrupa todos os itens numa única "refeição especial"
          anyExists = true
          sources.push({ id: scheduledOrder.id, kind: "scheduled" })

          const last = latestReviewedAt as Date | null

          if (!scheduledOrder.reviewedAt) {
            anyReviewed = false
          } else if (
            last === null ||
            scheduledOrder.reviewedAt.getTime() > last.getTime()
          ) {
            latestReviewedAt = scheduledOrder.reviewedAt
          }

          meals.push({
            mealType: "ESPECIAL",
            items: scheduledOrder.items.map(i => ({
              itemName: i.item.name,
              subcategoryName: i.subcategory?.name ?? null,
              quantity: i.quantity,
            })),
          })
        } else {
          // Sem ScheduledOrder: processa por mealType (Order real ou projeção)
          const configsByMeal = new Map<string, typeof user.itemConfigs>()
          for (const config of user.itemConfigs) {
            const mt = config.item.mealType
            if (!configsByMeal.has(mt)) configsByMeal.set(mt, [])
            configsByMeal.get(mt)!.push(config)
          }

          for (const [mealType, configs] of configsByMeal) {
            const normalOrder = normalIdx.get(`${user.id}::${dateKey}::${mealType}`)

            if (normalOrder) {
              anyExists = true
              sources.push({ id: normalOrder.id, kind: "normal" })

              if (!normalOrder.reviewedAt) {
                  anyReviewed = false
                } else {
                  const reviewedAt = normalOrder.reviewedAt

                  if (
                    latestReviewedAt === null ||
                    reviewedAt.getTime() > latestReviewedAt.getTime()
                  ) {
                    latestReviewedAt = reviewedAt
                  }
                }

              meals.push({
                mealType,
                items: normalOrder.items.map(i => ({
                  itemName: i.item.name,
                  subcategoryName: i.subcategory?.name ?? null,
                  quantity: i.quantity,
                })),
              })
              continue
            }

            // Projeção
            const projectedItems: MealEntry["items"] = []
            for (const config of configs) {
              if (config.subcategories?.length) {
                for (const subConfig of config.subcategories) {
                  const qty = getDefaultQty(subConfig, dayType)
                  if (qty <= 0) continue
                  projectedItems.push({
                    itemName: config.item.name,
                    subcategoryName: subConfig.subcategory.name,
                    quantity: qty,
                  })
                }
              } else {
                const qty = getDefaultQty(config, dayType)
                if (qty > 0) {
                  projectedItems.push({ itemName: config.item.name, subcategoryName: null, quantity: qty })
                } else {
                  const fbOrder = fallbackIdx.get(`${user.id}::${mealType}`)
                  if (fbOrder) {
                    const fbItem = fbOrder.items.find(i => i.itemId === config.itemId)
                    if (fbItem) {
                      projectedItems.push({
                        itemName: config.item.name,
                        subcategoryName: fbItem.subcategory?.name ?? null,
                        quantity: fbItem.quantity,
                      })
                    }
                  }
                }
              }
            }

            if (projectedItems.length === 0) continue

            hasProjection = true
            meals.push({ mealType, items: projectedItems })
          }
        }

        if (meals.length === 0) continue

        rows.push({
          userId: user.id,
          date: dateKey,
          companyName: user.company.socialName,
          cnpj: user.company.cnpj,
          meals,
          sources,
          // Se não existe nenhum pedido real ainda (tudo projeção), reviewedAt fica null
          reviewedAt: anyExists && anyReviewed ? (latestReviewedAt?.toISOString() ?? null) : null,
          hasProjection,
        })

        daysWithOrders.add(dateKey)
      }
    }

    rows.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      return a.companyName < b.companyName ? -1 : 1
    })

    // Paginação sobre as linhas já agrupadas 
    const total = rows.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({
      rows: paginatedRows,
      daysWithOrders: [...daysWithOrders].sort(),
      pagination: { page, pageSize, total, totalPages },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}