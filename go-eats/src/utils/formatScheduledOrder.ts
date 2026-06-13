type ScheduledSubcategory = {
  name: string
  quantity: number
}




type ScheduledOrderEmail = {
  companyName: string
  period: string
  itemName: string
  quantity?: number
  subcategories?: {
    name: string
    quantity: number
  }[]
}

export function formatScheduledOrderMessage({
  companyName,
  period,
  itemName,
  quantity,
  subcategories,
}: ScheduledOrderEmail) {
  let text = ""

  text += "📅 PEDIDO ESPECIAL AGENDADO\n"
  text += "══════════════════════\n\n"

  text += `🏢 Empresa: ${companyName}\n`
  text += `📆 Período: ${period}\n\n`

  text += "📦 ITENS\n"
  text += "──────────────────────\n"

  if (subcategories?.length) {
    subcategories.forEach(sub => {
      text += `• ${itemName} - ${sub.name}\n`
      text += `  Quantidade: ${sub.quantity}\n\n`
    })
  } else {
    text += `• ${itemName}\n`
    text += `  Quantidade: ${quantity}\n\n`
  }

  text += "══════════════════════\n"
  text += "⚠️ Pedido especial agendado pelo sistema"

  return text
}