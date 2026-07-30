

export type UserItemConfigTable = {
  defaultQuantity: number | null,
  item: {
    id: string
    mealtype: string,
    name: string
  }
}


export type UsersTable = {
  id: string,
  email: string,
  role: string,
  itemConfigs: UserItemConfigTable[]
  company: {
    cnpj: string,
    socialName: string
  }
}