import { OrderFromDB } from "../types/order-db.types"

type FormatOrderParams = {
  order: OrderFromDB
  userName: string
  companyName?: string
  isScheduled?: boolean
}

export function formatOrderMessage({
  order,
  userName,
  companyName,
  isScheduled = false,
}: FormatOrderParams) {
  const createdAt = new Date(order.createdAt).toLocaleString("pt-BR")

  let text = ""

  text += isScheduled
    ? "📅 PEDIDO ESPECIAL\n"
    : "🍽️ PEDIDO PADRÃO\n"

  text += "══════════════════════\n\n"

  text += `👤 Solicitante: ${userName}\n`

  if (companyName) {
    text += `🏢 Empresa: ${companyName}\n`
  }

  text += `🕒 Data de envio: ${createdAt}\n`
  text += `🆔 Pedido: ${order.id}\n\n`

  text += "📦 ITENS\n"
  text += "──────────────────────\n"

  order.items.forEach(item => {
    if (item.subcategory) {
      text += `• ${item.item.name} - ${item.subcategory.name}\n`
      text += `  Quantidade: ${item.quantity}\n`
    } else {
      text += `• ${item.item.name}\n`
      text += `  Quantidade: ${item.quantity}\n`
    }

    text += "\n"
  })

  text += "══════════════════════\n"
  text += "✅ Pedido enviado pelo sistema GoEats"

  return text
}