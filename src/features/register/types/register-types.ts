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
  "Pedidos Especiais"
] as const

export type ItemType = (typeof ITEM_VALUES)[number]



export const SUBCATEGORIES_VALUES = [
  "Granel",
  "MTX8",
  "MTX9",
  "Divisional",
  "Complemento de refeição",
  "Dieta"
] as const


export const SUBCATEGORIES_DRINKS = [
  "Achocolatado",
  "Litro de leite",
  "Litro de café",
  "Litro de chá",
  "Café com leite",
  "Água mineral",
  "Refrigerante"
] as const



export const SUBCATEGORIES_ESPECIAL = [
  "Bolo de aniversário",
  "Churrasco",
  "Coffee Break"
] as const


export const SUBCATEGORIES_LANCHE = [
  "Lanche comum",
  "Lanche especial",
] as const


export const SUBCATEGORIES_DESJEJUM = [
  "Comum",
  "Especial",
  "ADM"
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
  "Pedidos Especiais": "PEDIDOS_ESPECIAIS"
} as const





export const ITEMS_WITH_SUBCATEGORY: ItemType[] = ["Desjejum", "Almoço", "Ceia", "Jantar", "Lanche", "Bebidas", "Pedidos Especiais"]



export type FoodSubcategory = typeof SUBCATEGORIES_VALUES[number]
export type DrinkSubcategory = typeof SUBCATEGORIES_DRINKS[number]
export type SpecialSubcategory = typeof SUBCATEGORIES_ESPECIAL[number]
export type LancheSubcategory = typeof SUBCATEGORIES_LANCHE[number]
export type DesjejumSubcategory = typeof SUBCATEGORIES_DESJEJUM[number]

export type Subcategory = FoodSubcategory | DrinkSubcategory | SpecialSubcategory | LancheSubcategory | DesjejumSubcategory

export type SelectedSubcategory = {
  name: Subcategory
  mondayQuantity?: number
  tuesdayQuantity?: number
  wednesdayQuantity?: number
  thursdayQuantity?: number
  fridayQuantity?: number
  saturdayQuantity?: number
  sundayQuantity?: number
}



export type SelectedItem = {
  item: ItemType
  subcategories?: SelectedSubcategory[]
  mondayQuantity?: number
  tuesdayQuantity?: number
  wednesdayQuantity?: number
  thursdayQuantity?: number
  fridayQuantity?: number
  saturdayQuantity?: number
  sundayQuantity?: number
  comment?: string
}








export const SubcategorySchema = z.object({
  name: z.union([
    z.enum(SUBCATEGORIES_VALUES),
    z.enum(SUBCATEGORIES_DRINKS),
    z.enum(SUBCATEGORIES_ESPECIAL),
    z.enum(SUBCATEGORIES_LANCHE),
    z.enum(SUBCATEGORIES_DESJEJUM)
  ]),
  mondayQuantity: z.number().int().nonnegative().optional(),
  tuesdayQuantity: z.number().int().nonnegative().optional(),
  wednesdayQuantity: z.number().int().nonnegative().optional(),
  thursdayQuantity: z.number().int().nonnegative().optional(),
  fridayQuantity: z.number().int().nonnegative().optional(),
  saturdayQuantity: z.number().int().nonnegative().optional(),
  sundayQuantity: z.number().int().nonnegative().optional(),
})

export const ItemSchema = z.object({
  item: z.enum(ITEM_VALUES),
  subcategories: z.array(SubcategorySchema).optional(),
  mondayQuantity: z.number().int().nonnegative().optional(),
  tuesdayQuantity: z.number().int().nonnegative().optional(),
  wednesdayQuantity: z.number().int().nonnegative().optional(),
  thursdayQuantity: z.number().int().nonnegative().optional(),
  fridayQuantity: z.number().int().nonnegative().optional(),
  saturdayQuantity: z.number().int().nonnegative().optional(),
  sundayQuantity: z.number().int().nonnegative().optional(),
  comment: z.string().max(500).optional(), 
}).refine(
  data =>
    !(
      data.subcategories?.length &&
      (
        data.mondayQuantity !== undefined ||
        data.tuesdayQuantity !== undefined ||
        data.wednesdayQuantity !== undefined ||
        data.thursdayQuantity !== undefined ||
        data.fridayQuantity !== undefined ||
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

export const EditUserSchema = z.object({
  email: z.email("Email inválido").optional().or(z.literal("")),
  password: z.string().min(5).max(50).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]).optional(),
  company: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
})

export type EditUserForm = z.infer<typeof EditUserSchema>



export type TypeForm = z.infer<typeof TypeSchemaForm>