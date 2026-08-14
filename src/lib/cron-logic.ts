import { prisma } from "@/lib/prisma"
import { sendEmail } from "./email"
import { formatDailyDigestEmail, DigestItem } from "../utils/formatDailyDigest"
import { getDay, addDays, startOfDay, endOfDay, format } from "date-fns"

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
  "sundayQuantity",
  "mondayQuantity",
  "tuesdayQuantity",
  "wednesdayQuantity",
  "thursdayQuantity",
  "fridayQuantity",
  "saturdayQuantity",
]

function getDayField(date: Date): DayField {
  return DAY_FIELD_BY_INDEX[getDay(date)]
}

function getDefaultQuantity(
  config: Partial<Record<DayField, number | null>>,
  dayField: DayField
) {
  return config[dayField] ?? 0
}

// Sexta-feira -> agenda de sábado E domingo sai junto, já que não há
// execução de cron no fim de semana
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
  const rangeStart = startOfDay(targetDates[0])
  const rangeEnd = endOfDay(targetDates[targetDates.length - 1])
  const yesterdayStart = startOfDay(addDays(targetDates[0], -1))
  const yesterdayEnd = endOfDay(addDays(targetDates[0], -1))

  // ── Busca tudo em lote, de uma vez, em paralelo ──
  const [users, scheduledOrders, yesterdayOrders] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      include: {
        company: true,
        itemConfigs: {
          where: { item: { mealType: { in: meals } } },
          include: {
            item: true,
            subcategories: { include: { subcategory: true } },
          },
        },
      },
    }),
    prisma.scheduledOrder.findMany({
      where: { date: { gte: rangeStart, lte: rangeEnd } },
      include: { items: { include: { item: true, subcategory: true } } },
    }),
    prisma.order.findMany({
      where: {
        date: { gte: yesterdayStart, lte: yesterdayEnd },
        mealType: { in: meals },
      },
      include: { items: { include: { item: true, subcategory: true } } },
    }),
  ])

  // Índices em memória — O(1) lookup em vez de query por combinação
  const scheduledIdx = new Map<string, typeof scheduledOrders[number]>()
  for (const so of scheduledOrders) {
    scheduledIdx.set(`${so.userId}::${format(so.date, "yyyy-MM-dd")}`, so)
  }

  const yesterdayIdx = new Map<string, typeof yesterdayOrders[number]>()
  for (const o of yesterdayOrders) {
    yesterdayIdx.set(`${o.userId}::${o.mealType}`, o)
  }


  const pendingEmails: { companyName: string; subject: string; message: string }[] = []

  

  for (const user of users) {
    if (!user.itemConfigs.length) continue

    const digestItems: DigestItem[] = []

    for (const targetDate of targetDates) {
      const dateKey = format(targetDate, "yyyy-MM-dd")
      const dayField = getDayField(targetDate)

      const scheduled = scheduledIdx.get(`${user.id}::${dateKey}`)

      if (scheduled?.items.length) {
        // Um ScheduledOrder cobre TODOS os itens do dia — usa direto,
        // sem precisar filtrar por config individualmente
        for (const si of scheduled.items) {
          if (!meals.includes(si.item.mealType as MealType)) continue
          digestItems.push({
            date: targetDate,
            mealType: si.item.mealType,
            itemName: si.item.name,
            subcategoryName: si.subcategory?.name,
            quantity: si.quantity,
            source: "special",
            comment: si.comment ?? undefined,
          })
        }
        continue
      }

      for (const config of user.itemConfigs) {
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
          continue
        }

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

        // Fallback: repete o pedido de ontem, só faz sentido para "amanhã"
        // (não faz sentido pro domingo repetir "sábado - 1 dia" = sexta
        // com dados diferentes, mas mantemos o comportamento original:
        // fallback sempre olha o dia anterior a targetDates[0])
        const fbOrder = yesterdayIdx.get(`${user.id}::${config.item.mealType}`)
        if (fbOrder) {
          const fbItem = fbOrder.items.find(i => i.itemId === config.itemId)
          if (fbItem) {
            digestItems.push({
              date: targetDate,
              mealType: config.item.mealType,
              itemName: fbItem.item.name,
              subcategoryName: fbItem.subcategory?.name,
              quantity: fbItem.quantity,
              source: "fallback",
              comment: fbItem.customText ?? undefined,
            })
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


    pendingEmails.push({
      companyName: user.company.socialName,
      subject: `Pedidos ${cronKey === "1430" ? "Desjejum/Bebidas" : cronKey === "0800" ? "Almoço" : "Jantar"} - ${user.company.socialName}`,
      message,
    })

    const BATCH_SIZE = 4
  let emailsSent = 0

  for (let i = 0; i < pendingEmails.length; i += BATCH_SIZE) {
    const batch = pendingEmails.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(email => sendEmail({ subject: email.subject, message: email.message }))
    )

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        emailsSent++
        console.log(`[cron:${cronKey}] Email enviado para ${batch[idx].companyName}`)
      } else {
        console.error(`[cron:${cronKey}] Falha ao enviar para ${batch[idx].companyName}:`, result.reason)
      }
    })
  }

  console.log(`[cron:${cronKey}] Finalizado. ${emailsSent} email(s) enviado(s).`)
  return { emailsSent }
 
 }
}