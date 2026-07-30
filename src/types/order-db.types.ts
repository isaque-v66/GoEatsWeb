import { Order as PrismaOrder, OrderItem, Item, Subcategory, User, Company } from "@prisma/client"

export type OrderFromDB = PrismaOrder & {
  user: User
  company: Company
  items: (OrderItem & {
    item: Item
    subcategory: Subcategory | null
  })[]
}
