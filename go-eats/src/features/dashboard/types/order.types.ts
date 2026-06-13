import { ItemType, SubcategoryType } from "../constants/itemValues.constants"


export type ScheduleType =
  | "WEEKDAY"
  | "SATURDAY"
  | "SUNDAY"



  

export type OrderSubcategory = {
  id: string

  name: SubcategoryType

  quantity: number

  scheduleType: ScheduleType

  startDate?: string       
  endDate?: string

  specificDate?: string

  updateDefault?: boolean
}




export type OrderItem = {
  id: string

  item: ItemType

  quantity?: number

  scheduleType?: ScheduleType

  specificDate?: string

  startDate?: string       
  endDate?: string  

  updateDefault?: boolean

  subcategories?: OrderSubcategory[]
}




export type Order = {
  items: OrderItem[]
}