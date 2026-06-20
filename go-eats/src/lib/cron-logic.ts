import { prisma } from "@/lib/prisma"
import { sendEmail } from "./email"
import { formatDailyDigestEmail, DigestItem } from "../utils/formatDailyDigest"
import { getDay, addDays, startOfDay, endOfDay } from "date-fns"

// Horários de corte por refeição
// 14:30 -> Desjejum + Bebidas (do DIA SEGUINTE)
// 08:00 -> Almoço (do DIA SEGUINTE)
// 09:00 -> Jantar + Ceia (do DIA SEGUINTE)

type MealType =
  | "DESJEJUM"
  | "ALMOCO"
  | "CAFE_TARDE"
  | "JANTAR"
  | "CEIA"
  | "LANCHE"
  | "BEBIDAS"
  | "CAFE_NOTURNO"

export type CronKey = "1430" | "0800" | "0900"

// Quais refeições cada cron cobre
const MEALS_BY_CRON: Record<CronKey, MealType[]> = {
  "1430": ["DESJEJUM", "BEBIDAS", "CAFE_TARDE", "CAFE_NOTURNO"],
  "0800": ["ALMOCO", "LANCHE"],
  "0900": ["JANTAR", "CEIA"],
}

// Tipo do dia para buscar UserItemConfig
function getDayType(date: Date): "weekday" | "saturday" | "sunday" {
  const day = getDay(date)
  if (day === 0) return "sunday"
  if (day === 6) return "saturday"
  return "weekday"
}

// Quantidade padrão conforme o tipo do dia
function getDefaultQuantity(
  config: { weekdayQuantity?: number | null; saturdayQuantity?: number | null; sundayQuantity?: number | null },
  dayType: "weekday" | "saturday" | "sunday"
) {
  if (dayType === "saturday") return config.saturdayQuantity ?? 0
  if (dayType === "sunday") return config.sundayQuantity ?? 0
  return config.weekdayQuantity ?? 0
}

// Cálculo de qual data-alvo conforme o dia atual e horário de corte
// Sexta + 14:30 -> alvo = próximo sábado E domingo
function getTargetDates(cronKey: CronKey): Date[] {
  const now = new Date()
  const todayDay = getDay(now)

  if (cronKey === "1430" && todayDay === 5) {
    return [addDays(now, 1), addDays(now, 2)]
  }

  return [addDays(now, 1)]
}

export async function runCron(cronKey: CronKey) {
  console.log(`[cron:${cronKey}] Iniciando disparo automático...`)

  const meals = MEALS_BY_CRON[cronKey]
  const targetDates = getTargetDates(cronKey)

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      company: true,
      itemConfigs: {
        include: {
          item: true,
          subcategories: {
            include: { subcategory: true },
          },
        },
      },
    },
  })

  let emailsSent = 0

  for (const user of users) {
    const relevantConfigs = user.itemConfigs.filter(config =>
      meals.includes(config.item.mealType as MealType)
    )

    if (!relevantConfigs.length) continue

    const digestItems: DigestItem[] = []

    for (const targetDate of targetDates) {
      const dayType = getDayType(targetDate)

      for (const config of relevantConfigs) {
        const scheduled = await prisma.scheduledOrder.findFirst({
          where: {
            userId: user.id,
            date: {
              gte: startOfDay(targetDate),
              lte: endOfDay(targetDate),
            },
            items: {
              some: { itemId: config.itemId },
            },
          },
          include: {
            items: {
              where: { itemId: config.itemId },
              include: { item: true, subcategory: true },
            },
          },
        })

        if (scheduled?.items.length) {
          for (const si of scheduled.items) {
            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: si.item.name,
              subcategoryName: si.subcategory?.name,
              quantity: si.quantity,
              source: "special",
            })
          }
          continue
        }

        if (config.subcategories?.length) {
          for (const subConfig of config.subcategories) {
            const qty = getDefaultQuantity(subConfig, dayType)
            if (qty <= 0) continue

            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: config.item.name,
              subcategoryName: subConfig.subcategory.name,
              quantity: qty,
              source: "default",
            })
          }
        } else {
          const qty = getDefaultQuantity(config, dayType)

          if (qty > 0) {
            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: config.item.name,
              quantity: qty,
              source: "default",
            })
            continue
          }

          const yesterday = addDays(targetDate, -1)
          const prevOrder = await prisma.order.findFirst({
            where: {
              userId: user.id,
              mealType: config.item.mealType,
              date: {
                gte: startOfDay(yesterday),
                lte: endOfDay(yesterday),
              },
            },
            include: {
              items: {
                where: { itemId: config.itemId },
                include: { item: true, subcategory: true },
              },
            },
          })

          if (prevOrder?.items.length) {
            for (const pi of prevOrder.items) {
              digestItems.push({
                date: targetDate,
                mealType: config.item.mealType,
                itemName: pi.item.name,
                subcategoryName: pi.subcategory?.name,
                quantity: pi.quantity,
                source: "fallback",
              })
            }
          }
        }
      }
    }

    if (!digestItems.length) continue

    const message = formatDailyDigestEmail({
      companyName: user.company.socialName,
      cronKey,
      items: digestItems,
      
    })

    await sendEmail({
      subject: `Pedidos ${cronKey === "1430" ? "Desjejum/Bebidas" : cronKey === "0800" ? "Almoço" : "Jantar"} - ${user.company.socialName}`,
      message,
    })

    emailsSent++
    console.log(`[cron:${cronKey}] Email enviado para ${user.company.socialName}`)
  }

  console.log(`[cron:${cronKey}] Finalizado. ${emailsSent} email(s) enviado(s).`)
  return { emailsSent }
}
