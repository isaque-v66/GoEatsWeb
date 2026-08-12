export type UserSubcategoryConfigTable = {
  id: string
  mondayQuantity: number | null,
  tuesdayQuantity: number | null,
  wednesdayQuantity: number | null,
  thursdayQuantity: number | null,
  fridayQuantity: number | null,
  saturdayQuantity: number | null,
  sundayQuantity: number | null,
  subcategory: {
    id: string
    name: string
  }
}

export type UserItemConfigTable = {
  id: string
  mondayQuantity: number | null,
  tuesdayQuantity: number | null,
  wednesdayQuantity: number | null,
  thursdayQuantity: number | null,
  fridayQuantity: number | null,
  saturdayQuantity: number | null,
  sundayQuantity: number | null,
  comment: string | null
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