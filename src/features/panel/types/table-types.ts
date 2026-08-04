export type UserSubcategoryConfigTable = {
  id: string
  weekdayQuantity: number | null
  saturdayQuantity: number | null
  sundayQuantity: number | null
  subcategory: {
    id: string
    name: string
  }
}

export type UserItemConfigTable = {
  id: string
  weekdayQuantity: number | null
  saturdayQuantity: number | null
  sundayQuantity: number | null
  item: {
    id: string
    mealType: string
    name: string
  }
  subcategories: UserSubcategoryConfigTable[]
}

export type UsersTable = {
  id: string
  email: string
  role: string
  itemConfigs: UserItemConfigTable[]
  company: {
    id: string
    cnpj: string
    socialName: string
  }
}