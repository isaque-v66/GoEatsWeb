import z from "zod"

export const ITEM_VALUES = [
  "Desjejum",
  "Almoço",
  'Jantar',
  "Ceia",
  "Lanche",
  "Bebidas",
  "Café da tarde",
  "Café noturno",
] as const

export type ItemType = (typeof ITEM_VALUES)[number]



export const SUBCATEGORIES_VALUES = [
    "Granel",
    "MTX8",
    "MTX9",
    "Divisional"
] as const


export const SUBCATEGORIES_DRINKS = [
    "Achocolatado",
    "Litro de leite",
    "Litro de café",
    "Litro de chá"
] as const



export const MEAL_TYPE_MAP = {
  "Desjejum": "DESJEJUM",
  "Almoço": "ALMOCO",
  "Jantar": "JANTAR",
  "Ceia": "CEIA",
  "Lanche": "LANCHE",
  "Bebidas": "BEBIDAS",
  "Café da tarde": "CAFE_TARDE",
  "Café noturno": "CAFE_NOTURNO",
} as const



export const ITEMS_WITH_SUBCATEGORY: ItemType[] = ["Almoço", "Ceia", "Jantar", "Bebidas"]



export type FoodSubcategory = typeof SUBCATEGORIES_VALUES[number]
export type DrinkSubcategory = typeof SUBCATEGORIES_DRINKS[number]

export type Subcategory = FoodSubcategory | DrinkSubcategory

export type SelectedSubcategory = {
  name: Subcategory
  weekQuantity?: number
  saturdayQuantity?: number
  sundayQuantity?: number
}



export type SelectedItem = {
  item: ItemType
  subcategories?: SelectedSubcategory[]
  weekQuantity?: number
  saturdayQuantity?: number
  sundayQuantity?: number
}


export const SubcategorySchema = z.object({
  name: z.union([
    z.enum(SUBCATEGORIES_VALUES),
    z.enum(SUBCATEGORIES_DRINKS),
  ]),
  weekQuantity: z.number().int().nonnegative().optional(),
  saturdayQuantity: z.number().int().nonnegative().optional(),
  sundayQuantity: z.number().int().nonnegative().optional(),
})

export const ItemSchema = z.object({
  item: z.enum(ITEM_VALUES),
  subcategories: z.array(SubcategorySchema).optional(),
  weekQuantity: z.number().int().nonnegative().optional(),
  saturdayQuantity: z.number().int().nonnegative().optional(),
  sundayQuantity: z.number().int().nonnegative().optional(),
}).refine(
  data =>
    !(
      data.subcategories?.length &&
      (
        data.weekQuantity !== undefined ||
        data.saturdayQuantity !== undefined ||
        data.sundayQuantity !== undefined
      )
    ),
  {
    message:
      "Itens com subcategoria não podem ter quantidade direta",
  }
)

export const TypeSchemaForm = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(5).max(50),
  cnpj: z.string().transform(val => val.replace(/\D/g, "")).refine(
  val => val.length === 14,
  "CNPJ inválido"
),
  company: z.string(),
  nomeSocial: z.string(),
  items: z.array(ItemSchema),
})





export type TypeForm = z.infer<typeof TypeSchemaForm>