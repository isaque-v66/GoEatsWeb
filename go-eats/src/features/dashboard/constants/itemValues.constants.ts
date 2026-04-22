

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


export const ITEM_TO_MEAL_TYPE: Record<ItemType, MealType> = {
  Desjejum: MealType.DESJEJUM,
  Almoço: MealType.ALMOCO,
  Jantar: MealType.JANTAR,
  Ceia: MealType.CEIA,
  Lanche: MealType.LANCHE,
  Bebidas: MealType.BEBIDAS,
  "Café da tarde": MealType.CAFE_TARDE,
  "Café noturno": MealType.CAFE_NOTURNO,
  Outros: MealType.LANCHE, 
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


