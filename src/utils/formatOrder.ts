import { OrderFromDB } from "../types/order-db.types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type FormatOrderParams = {
  order: OrderFromDB
  isScheduled?: boolean
}

export function formatOrderMessage({ order, isScheduled = false }: FormatOrderParams) {
  const dateLabel = format(new Date(order.date), "dd/MM/yyyy", { locale: ptBR })

  let text = ""

  text += isScheduled ? "PEDIDO ESPECIAL\n" : "PEDIDO\n"
  text += "==============================\n\n"

  text += `Empresa: ${order.company.socialName}\n`
  text += `Data: ${dateLabel}\n\n`

  text += "ITENS\n"
  text += "------------------------------\n"

  order.items.forEach(item => {
    if (item.subcategory) {
      text += `- ${item.item.name} - ${item.subcategory.name}\n`
    } else {
      text += `- ${item.item.name}\n`
    }
    text += `  Quantidade: ${item.quantity}\n\n`
  })

  text += "==============================\n"
  text += "Pedido enviado pelo sistema GoEats"

  return text
}
