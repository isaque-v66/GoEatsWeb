export type HistoryOrderItem = {
  id: string
  itemName: string
  subcategoryName?: string
  quantity: number
}

// Pedido "normal" do dia — só consulta, sem edição (já foi enviado por email)
export type HistoryNormalOrder = {
  kind: "normal"
  id: string
  date: string // yyyy-MM-dd
  mealType: string
  items: HistoryOrderItem[]
}

// Pedido especial com data própria — editável (quantidade e data)
export type HistoryScheduledOrder = {
  kind: "scheduled"
  id: string
  date: string 
  applyAsDefault: boolean
  items: HistoryOrderItem[]
}

export type HistoryEntry = HistoryNormalOrder | HistoryScheduledOrder

export type OrderHistoryResponse = {
  entries: HistoryEntry[]
}
