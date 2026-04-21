

export const ITEM_VALUES = [
  "Desjejum",
  "Almoço",
  "Jantar",
  "Ceia",
  "Lanche",
  "Bebidas",
  "Café da tarde",
  "Café noturno",
  "Outros",
] as const

export type ItemType = (typeof ITEM_VALUES)[number]




export enum MealType {
  DESJEJUM = "DESJEJUM",
  ALMOCO = "ALMOCO",
  CAFE_TARDE = "CAFE_TARDE",
  JANTAR = "JANTAR",
  CEIA = "CEIA",
  LANCHE = "LANCHE",
  BEBIDAS = "BEBIDAS",
  CAFE_NOTURNO = "CAFE_NOTURNO",
  FIM_SEMANA = "FIM_SEMANA",
}

export type SubcategoryType = string

export type AvailableItem = {
  name: ItemType
  mealType: MealType
  subcategories?: {
    name: SubcategoryType
    defaultQuantity?: number | null
  }[]
}


