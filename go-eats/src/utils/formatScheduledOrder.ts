type ScheduledItem = {
  itemName: string
  subcategoryName?: string
  quantity: number
}

type ScheduledOrderEmail = {
  companyName: string
  period: string
  items: ScheduledItem[]
}

export function formatScheduledOrderMessage({
  companyName,
  period,
  items,
}: ScheduledOrderEmail) {
  let text = ""

  text += "PEDIDO ESPECIAL AGENDADO\n"
  text += "══════════════════════\n\n"
  text += `Empresa: ${companyName}\n`
  text += `Data: ${period}\n\n`
  text += "ITENS\n"
  text += "──────────────────────\n"

  for (const item of items) {
    if (item.subcategoryName) {
      text += `• ${item.itemName} - ${item.subcategoryName}\n`
    } else {
      text += `• ${item.itemName}\n`
    }
    text += `  Quantidade: ${item.quantity}\n\n`
  }

  text += "══════════════════════\n"
  text += "Pedido especial agendado pelo sistema"

  return text
}