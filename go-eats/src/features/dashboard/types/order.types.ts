import { ItemType, SubcategoryType } from "../constants/itemValues.constants"

export type OrderItem = {
  item: ItemType
  quantity?: number
  subcategory?: {
    name: SubcategoryType
    quantity: number
  }[]
}

export type Order = {
  items: OrderItem[]
}