
import { Order as PrismaOrder, OrderItem, Item, Subcategory } from "@prisma/client"

export type OrderFromDB = PrismaOrder & {
  items: (OrderItem & {
    item: Item,
    subcategory: Subcategory | null
  })[]
}