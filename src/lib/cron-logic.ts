import { prisma } from "@/lib/prisma"
import { sendEmailBatch } from "./email"
import {
  formatDailyDigestEmail,
  DigestItem,
} from "../utils/formatDailyDigest"
import {
  getDay,
  addDays,
  startOfDay,
  endOfDay,
  format,
} from "date-fns"

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
  "1430": [
    "DESJEJUM",
    "BEBIDAS",
    "CAFE_TARDE",
    "CAFE_NOTURNO",
  ],

  "0800": [
    "ALMOCO",
    "LANCHE",
  ],

  "0900": [
    "JANTAR",
    "CEIA",
  ],
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

function getDefaultQuantity(config: Partial<Record<DayField, number | null>>, dayField: DayField) {
  return config[dayField] ?? 0
}


function getTargetDates(cronKey: CronKey): Date[] {
  const now = new Date()
  const todayDay = getDay(now)

  if (todayDay === 5) {
    return [
      addDays(now, 1),
      addDays(now, 2),
    ]
  }

  return [
    addDays(now, 1),
  ]
}

export async function runCron(cronKey: CronKey) {
  console.log(
    `[cron:${cronKey}] Iniciando disparo automático...`
  )

  const meals = MEALS_BY_CRON[cronKey]

  const targetDates = getTargetDates(cronKey)

  const rangeStart = startOfDay(targetDates[0])

  const rangeEnd = endOfDay(
    targetDates[targetDates.length - 1]
  )

  const yesterdayStart = startOfDay(
    addDays(targetDates[0], -1)
  )

  const yesterdayEnd = endOfDay(
    addDays(targetDates[0], -1)
  )

  


  const [users, scheduledOrders, yesterdayOrders] = await Promise.all([
    prisma.user.findMany({
      where: {
        isActive: true,
      },

      include: {
        company: true,

        itemConfigs: {
          where: {
            item: {
              mealType: {
                in: meals,
              },
            },
          },

          include: {
            item: true,

            subcategories: {
              include: {
                subcategory: true,
              },
            },
          },
        },
      },
    }),

    prisma.scheduledOrder.findMany({
      where: {
        date: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },

      include: {
        items: {
          include: {
            item: true,
            subcategory: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      where: {
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },

        mealType: {
          in: meals,
        },
      },

      include: {
        items: {
          include: {
            item: true,
            subcategory: true,
          },
        },
      },
    }),
  ])

  
  const scheduledIdx =new Map<string,typeof scheduledOrders[number]>()


  for (const scheduledOrder of scheduledOrders) {
    scheduledIdx.set(
      `${scheduledOrder.userId}::${format(
        scheduledOrder.date,
        "yyyy-MM-dd"
      )}`,
      scheduledOrder
    )
  }

  const yesterdayIdx =new Map<string, typeof yesterdayOrders[number]>()

  for (const order of yesterdayOrders) {
    yesterdayIdx.set(
      `${order.userId}::${order.mealType}`,
      order
    )
  }

 
  const pendingEmails: {
    companyName: string
    subject: string
    message: string
  }[] = []

  /**
   * Processa todos os usuários.
   */
  for (const user of users) {
    if (!user.itemConfigs.length) {
      continue
    }

    const digestItems: DigestItem[] = []

    for (const targetDate of targetDates) {
      const dateKey = format(
        targetDate,
        "yyyy-MM-dd"
      )

      const dayField =
        getDayField(targetDate)

      // Verifica se existe pedido especial/agendado.
      const scheduled =
        scheduledIdx.get(
          `${user.id}::${dateKey}`
        )

      if (scheduled?.items.length) {
        
        for (const si of scheduled.items) {
          if (
            !meals.includes(
              si.item.mealType as MealType
            )
          ) {
            continue
          }

          digestItems.push({
            date: targetDate,

            mealType:
              si.item.mealType,

            itemName:
              si.item.name,

            subcategoryName:
              si.subcategory?.name,

            quantity:
              si.quantity,

            source: "special",

            comment:
              si.comment ?? undefined,
          })
        }

        continue
      }

      /**
       * Não existe pedido especial.
       * Utiliza a configuração padrão do usuário.
       */
      for (const config of user.itemConfigs) {
        
        if (config.subcategories?.length) {
          for (const subConfig of config.subcategories) {
            const qty =
              getDefaultQuantity(
                subConfig,
                dayField
              )

            if (qty <= 0) {
              continue
            }

            digestItems.push({
              date: targetDate,

              mealType:
                config.item.mealType,

              itemName:
                config.item.name,

              subcategoryName:
                subConfig.subcategory.name,

              quantity: qty,

              source: "default",

              comment:
                subConfig.comment ??
                config.comment ??
                undefined,
            })
          }

          continue
        }

        // Item sem subcategoria.
        const qty = getDefaultQuantity(config,dayField)

        if (qty > 0) {
          digestItems.push({
            date: targetDate,

            mealType:
              config.item.mealType,

            itemName:
              config.item.name,

            quantity: qty,

            source: "default",

            comment:
              config.comment ??
              undefined,
          })

          continue
        }

        //repete o pedido do dia anterior.
        const fbOrder =
          yesterdayIdx.get(
            `${user.id}::${config.item.mealType}`
          )

        if (fbOrder) {
          const fbItem =
            fbOrder.items.find(
              (item) =>
                item.itemId ===
                config.itemId
            )

          if (fbItem) {
            digestItems.push({
              date: targetDate,

              mealType:
                config.item.mealType,

              itemName:
                fbItem.item.name,

              subcategoryName:
                fbItem.subcategory?.name,

              quantity:
                fbItem.quantity,

              source: "fallback",

              comment:
                fbItem.customText ??
                undefined,
            })
          }
        }
      }
    }

    
    if (!digestItems.length) {
      continue
    }

    //Formata o conteúdo do e-mail.
    const message =
      formatDailyDigestEmail({
        companyName:
          user.company.socialName,

        cronKey,

        items: digestItems,
      })

    //Define o assunto.
    const subject =
      `Pedidos ${
        cronKey === "1430"
          ? "Desjejum/Bebidas"
          : cronKey === "0800"
            ? "Almoço"
            : "Jantar"
      } - ${user.company.socialName}`



    //Adiciona à fila do batch.
    pendingEmails.push({
      companyName:
        user.company.socialName,
      subject,
      message,
    })
  }

  
  if (pendingEmails.length === 0) {
    console.log(
      `[cron:${cronKey}] Nenhum e-mail para enviar.`
    )

    return {
      emailsSent: 0,
      emailsFailed: 0,
      emails: [],
      failed: [],
    }
  }

  console.log(
    `[cron:${cronKey}] ${pendingEmails.length} e-mail(s) preparados para envio.`
  )

  /**
   * Envia através do Batch API do Resend.
   *
   * O Resend aceita até 100 e-mails por chamada.
   * A função sendEmailBatch() já divide automaticamente
   * quantidades maiores em chunks de 100.
   */
  const {sent, failed} = await sendEmailBatch(pendingEmails)




  // Log dos e-mails aceitos pelo Resend. 
  for (const email of sent) {
    console.log(
      `[cron:${cronKey}] Email aceito pelo Resend:`,
      {
        companyName:
          email.companyName,

        resendId:
          email.resendId,

        subject:
          email.subject,
      }
    )
  }

  
  for (const email of failed) {
    console.error(
      `[cron:${cronKey}] Falha ao enviar para ${email.companyName}:`,
      email.error
    )
  }

  console.log(
    `[cron:${cronKey}] Finalizado. ` +
      `${sent.length} e-mail(s) aceito(s) pelo Resend. ` +
      `${failed.length} e-mail(s) com falha.`
  )

  return {
 
    emailsSent: sent.length, // entregue ao RESEND

    emailsFailed: failed.length,

   
    emails: sent,

    failed,
  }
}