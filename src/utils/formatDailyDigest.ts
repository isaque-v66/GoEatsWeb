import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type DigestItem = {
  date: Date
  mealType: string
  itemName: string
  subcategoryName?: string
  quantity: number
  source: "default" | "special" | "fallback"
}

type DigestEmailParams = {
  companyName: string
  cronKey: "1430" | "0800" | "0900"
  items: DigestItem[]
}

const MEAL_LABELS: Record<string, string> = {
  DESJEJUM: "Desjejum",
  ALMOCO: "Almoço",
  CAFE_TARDE: "Café da Tarde",
  JANTAR: "Jantar",
  CEIA: "Ceia",
  LANCHE: "Lanche",
  BEBIDAS: "Bebidas",
  CAFE_NOTURNO: "Café Noturno",
}

const CRON_LABELS: Record<string, string> = {
  "1430": "Desjejum, Bebidas e Café",
  "0800": "Almoço e Lanche",
  "0900": "Jantar e Ceia",
}

export function formatDailyDigestEmail({
  companyName,
  cronKey,
  items,
}: DigestEmailParams): string {
  // Agrupa por data, depois por refeição
  const byDate = new Map<string, Map<string, DigestItem[]>>()

  for (const item of items) {
    const dateKey = format(item.date, "yyyy-MM-dd")
    const dateLabel = format(item.date, "EEEE, dd 'de' MMMM", { locale: ptBR })
    const fullKey = `${dateKey}||${dateLabel}`

    if (!byDate.has(fullKey)) byDate.set(fullKey, new Map())
    const byMeal = byDate.get(fullKey)!

    if (!byMeal.has(item.mealType)) byMeal.set(item.mealType, [])
    byMeal.get(item.mealType)!.push(item)
  }

  let text = ""
  text += `RESUMO DE PEDIDOS - ${CRON_LABELS[cronKey].toUpperCase()}\n`
  text += "==============================\n\n"
  text += `Empresa: ${companyName}\n\n`

  for (const [fullKey, byMeal] of byDate) {
    const dateLabel = fullKey.split("||")[1]
    const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

    text += `${capitalizedDate}\n`
    text += "------------------------------\n"

    for (const [mealType, mealItems] of byMeal) {
      text += `\n${MEAL_LABELS[mealType] ?? mealType}\n`

      for (const item of mealItems) {
        if (item.subcategoryName) {
          text += `  - ${item.itemName} - ${item.subcategoryName}: ${item.quantity}\n`
        } else {
          text += `  - ${item.itemName}: ${item.quantity}\n`
        }
      }
    }

    text += "\n"
  }

  text += "==============================\n"
  text += "Enviado automaticamente pelo sistema GoEats"

  return text
}
