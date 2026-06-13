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
  userName: string
  companyName: string
  cronKey: "1430" | "0800" | "0900"
  items: DigestItem[]
}

const MEAL_LABELS: Record<string, string> = {
  DESJEJUM: "☕ Desjejum",
  ALMOCO: "🍽️ Almoço",
  CAFE_TARDE: "🍰 Café da Tarde",
  JANTAR: "🌙 Jantar",
  CEIA: "🌃 Ceia",
  LANCHE: "🥪 Lanche",
  BEBIDAS: "🥤 Bebidas",
  CAFE_NOTURNO: "☕ Café Noturno",
}

const CRON_LABELS: Record<string, string> = {
  "1430": "Desjejum, Bebidas e Café",
  "0800": "Almoço e Lanche",
  "0900": "Jantar e Ceia",
}

const SOURCE_LABELS: Record<DigestItem["source"], string> = {
  default: "padrão",
  special: "pedido especial",
  fallback: "ref. dia anterior",
}

export function formatDailyDigestEmail({
  userName,
  companyName,
  cronKey,
  items,
}: DigestEmailParams): string {
  const now = new Date()
  const sentAt = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

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
  text += `📋 RESUMO DE PEDIDOS — ${CRON_LABELS[cronKey].toUpperCase()}\n`
  text += "══════════════════════════════\n\n"
  text += `🏢 Empresa: ${companyName}\n`
  text += `👤 Usuário: ${userName}\n`
  text += `🕒 Gerado em: ${sentAt}\n\n`

  for (const [fullKey, byMeal] of byDate) {
    const dateLabel = fullKey.split("||")[1]
    const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

    text += `📅 ${capitalizedDate}\n`
    text += "──────────────────────────────\n"

    for (const [mealType, mealItems] of byMeal) {
      text += `\n${MEAL_LABELS[mealType] ?? mealType}\n`

      for (const item of mealItems) {
        const sourceTag = item.source !== "default"
          ? ` [${SOURCE_LABELS[item.source]}]`
          : ""

        if (item.subcategoryName) {
          text += `  • ${item.itemName} - ${item.subcategoryName}: ${item.quantity}${sourceTag}\n`
        } else {
          text += `  • ${item.itemName}: ${item.quantity}${sourceTag}\n`
        }
      }
    }

    text += "\n"
  }

  text += "══════════════════════════════\n"

  const hasSpecial = items.some(i => i.source === "special")
  const hasFallback = items.some(i => i.source === "fallback")

  if (hasSpecial || hasFallback) {
    text += "\n📌 LEGENDA\n"
    if (hasSpecial) text += "  [pedido especial] → quantidade alterada pelo cliente\n"
    if (hasFallback) text += "  [ref. dia anterior] → sem padrão definido, usando pedido anterior\n"
  }

  text += "\n✅ Enviado automaticamente pelo sistema GoEats"

  return text
}