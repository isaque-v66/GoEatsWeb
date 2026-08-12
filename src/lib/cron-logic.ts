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

type DayField =
  | "mondayQuantity"
  | "tuesdayQuantity"
  | "wednesdayQuantity"
  | "thursdayQuantity"
  | "fridayQuantity"
  | "saturdayQuantity"
  | "sundayQuantity"

const DAY_FIELD_BY_INDEX: DayField[] = [
  "sundayQuantity",    // getDay() === 0
  "mondayQuantity",    // 1
  "tuesdayQuantity",   // 2
  "wednesdayQuantity", // 3
  "thursdayQuantity",  // 4
  "fridayQuantity",    // 5
  "saturdayQuantity",  // 6
]

function getDayField(date: Date): DayField {
  return DAY_FIELD_BY_INDEX[getDay(date)]
}

// Quantidade padrão conforme o campo do dia
function getDefaultQuantity(
  config: Partial<Record<DayField, number | null>>,
  dayField: DayField
) {
  return config[dayField] ?? 0
}

// Cálculo de qual data-alvo conforme o dia atual e horário de corte
// Sexta + 14:30 -> alvo = próximo sábado E domingo
function getTargetDates(cronKey: CronKey): Date[] {
  const now = new Date()
  const todayDay = getDay(now)

  if (todayDay === 5) {
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
      const dayField = getDayField(targetDate)

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
              comment: si.comment ?? undefined,
            })
          }
          continue
        }

        if (config.subcategories?.length) {
          for (const subConfig of config.subcategories) {
            const qty = getDefaultQuantity(subConfig, dayField)
            if (qty <= 0) continue

            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: config.item.name,
              subcategoryName: subConfig.subcategory.name,
              quantity: qty,
              source: "default",
              comment: subConfig.comment ?? config.comment ?? undefined,
            })
          }
        } else {
          const qty = getDefaultQuantity(config, dayField)

          if (qty > 0) {
            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: config.item.name,
              quantity: qty,
              source: "default",
              comment: config.comment ?? undefined,
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
                comment: pi.customText ?? undefined,
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