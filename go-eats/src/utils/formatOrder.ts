import { OrderFromDB } from "../types/order-db.types"

export function formatOrderMessage(order: OrderFromDB) {
  let text = "🧾 *Pedido do dia*\n\n"

  order.items.forEach((item) => {
    if (item.subcategory) {
      text += `🍽️ ${item.item.name} - ${item.subcategory.name}: ${item.quantity}\n`
    } else {
      text += `🍽️ ${item.item.name}: ${item.quantity}\n`
    }
  })

  text += "\n✅ Enviado automaticamente pelo sistema"

  return text
}