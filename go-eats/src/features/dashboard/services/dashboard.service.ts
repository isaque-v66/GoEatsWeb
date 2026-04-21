
import { AvailableItem } from "../constants/itemValues.constants"


export async function getDashboardItems(userId: string): Promise<AvailableItem[]> {
  const res = await fetch(`/api/dashboard/items?userId=${userId}`, {
    cache: "no-store"
  })

  if (!res.ok) {
    throw new Error("Erro ao buscar itens")
  }

  const data = await res.json()
  return data.items || []
}