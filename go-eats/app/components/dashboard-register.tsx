"use client"

import { useState } from "react"
import { Card, CardContent} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useTheme } from "../contexts/theme-context"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { Header } from "./header"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useFormData } from "../contexts/formRegister-context"




const ITEM_VALUES = [
  "Desjejum",
  "Almoço",
  'Jantar',
  "Ceia",
  "Lanche",
  "Bebidas",
  "Café da tarde",
  "Café noturno",
] as const

type ItemType = (typeof ITEM_VALUES)[number]



const SUBCATEGORIES_VALUES = [
    "Granel",
    "MTX8",
    "MTX9",
    "Divisional"
] as const


const SUBCATEGORIES_DRINKS = [
    "Achocolatado",
    "Litro de leite",
    "Litro de café",
    "Litro de chá"
] as const



const MEAL_TYPE_MAP = {
  "Desjejum": "DESJEJUM",
  "Almoço": "ALMOCO",
  "Jantar": "JANTAR",
  "Ceia": "CEIA",
  "Lanche": "LANCHE",
  "Bebidas": "BEBIDAS",
  "Café da tarde": "CAFE_TARDE",
  "Café noturno": "CAFE_NOTURNO",
} as const



const ITEMS_WITH_SUBCATEGORY: ItemType[] = ["Almoço", "Ceia", "Jantar"]



type FoodSubcategory = typeof SUBCATEGORIES_VALUES[number]
type DrinkSubcategory = typeof SUBCATEGORIES_DRINKS[number]

type Subcategory = FoodSubcategory | DrinkSubcategory

type SelectedSubcategory = {
  name: Subcategory
  quantity?: number
}



type SelectedItem = {
  item: ItemType
  subcategories?: SelectedSubcategory[]
  quantity?: number
}




// VALIDAÇÃO ZOD
const SubcategorySchema = z.object({
  name: z.union([
    z.enum(SUBCATEGORIES_VALUES),
    z.enum(SUBCATEGORIES_DRINKS),
  ]),
  quantity: z.number().int().nonnegative().optional(),
})

const ItemSchema = z.object({
  item: z.enum(ITEM_VALUES),
  subcategories: z.array(SubcategorySchema).optional(),
  quantity: z.number().int().nonnegative().optional(),
}).refine(
  data =>
    !(data.subcategories?.length && data.quantity !== undefined),
  {
    message: "Itens com subcategoria não podem ter quantidade direta",
    path: ["quantity"],
  }
)

const TypeSchemaForm = z.object({
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





export function DashboardRegister(){
    const [ativo, setAtivo] = useState<boolean>(false)
    const {setData} = useFormData()
    const router = useRouter()
    const {theme} = useTheme()
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
    const { register, handleSubmit, setValue } = useForm<TypeForm>({
  resolver: zodResolver(TypeSchemaForm),
  defaultValues: { items: [] },
})


    


  function itemSelect(item: ItemType) {
  setSelectedItems(prev => {
    const exists = prev.find(i => i.item === item)

    let updated: SelectedItem[]

    if (exists) {
      updated = prev.filter(i => i.item !== item)

    } else {
      updated = [...prev, { item }]
      
    }


    setValue("items", updated)
    return updated
  })
}




function toggleSubcategory(item: ItemType, sub: Subcategory) {
  setSelectedItems(prev => {
    const updated = prev.map(i => {
      if (i.item !== item) {
        return i
      }

      const current = i.subcategories ?? []
      const exists = current.find(s => s.name === sub)

      return {
        ...i,
        subcategories: exists ? current.filter(s => s.name !== sub) : [...current, { name: sub }], quantity: undefined, 
      }
    })

    setValue("items", updated)
    return updated
  })
}



function setSubcategoryQuantity(item: ItemType, sub: Subcategory, quantity: number) {
  setSelectedItems(prev => {
    const updated = prev.map(i => {
      if (i.item !== item) return i

      return {
        ...i,
        subcategories: i.subcategories?.map(s => s.name === sub ? { ...s, quantity } : s
        ),
      }
    })

    setValue("items", updated)
    return updated
  })
}





function setQuantity(item: ItemType, quantity: number) {
  setSelectedItems(prev => {
    const updated = prev.map(i =>
      i.item === item ? { ...i, quantity } : i
    )

    setValue("items", updated)
    return updated
  })
}







  function formHandle(form: TypeForm) {
  const normalizedForm = {
    ...form,
    cnpj: form.cnpj.replace(/\D/g, ""),
    items: form.items.map(item => {
      const hasSub = item.subcategories && item.subcategories.length > 0

      return {
        item: item.item,
        mealType: MEAL_TYPE_MAP[item.item],

      
        quantity: hasSub ? undefined : ativo ? item.quantity : undefined,

        
        subcategories: hasSub
          ? item.subcategories?.map(sub => ({
              name: sub.name,
              quantity: ativo ? sub.quantity : undefined,
            }))
          : undefined,
      }
    }),
  }

  setData(normalizedForm)
  router.replace("/confirm")
}






    
     

return (
  <div>
  <Header />

    {/* FORMULÁRIO */}
    <div className="flex flex-col mt-2">
      <div className="text-3xl font-bold text-center tracking-tight transition-colors duration-300 mt-6 mb-6">
        <h2>Registre novos usuários</h2>
      </div>

      <div className="flex justify-center items-start p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-8">
            <h2 className={`text-2xl font-bold text-center mb-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Cadastro
            </h2>

            <form onSubmit={handleSubmit(formHandle)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLUNA 1 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@gmail.com"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("password")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeSocial" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Nome da empresa
                    </Label>
                    <Input
                      id="company"
                      placeholder="ABS Company Plus"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("company")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeSocial" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Nome Social
                    </Label>
                    <Input
                      id="NomeSocial"
                      placeholder="Exemple LTDA"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("nomeSocial")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("cnpj")}
                    />
                  </div>

                   
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label>Este usuário terá quantidade de itens por padrão?</Label>
                            <Switch 
                            id="sim-nao-switch" 
                            checked={ativo} 
                            onCheckedChange={setAtivo} 
                            />
                            <Label htmlFor="sim-nao-switch">
                            {ativo ? "Sim" : "Não"}
                            </Label>
                        </div>


                        {/* Opção de quantidade */}        
                        {ativo && selectedItems.length > 0 && (
                        <div className="space-y-4 mt-4">
                            <Label className="font-semibold">
                            Quantidade padrão por item (opcional)
                            </Label>

                           {selectedItems.filter(i => !ITEMS_WITH_SUBCATEGORY.includes(i.item))
                            .map(({ item, quantity }) => (
                                <div key={item} className="flex items-center gap-4">
                                <span className="w-40 text-sm font-medium">{item}</span>

                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Quantidade"
                                    value={quantity ?? ""}
                                    onChange={e =>
                                    setQuantity(item, Number(e.target.value))
                                    }
                                    className="w-32"
                                />
                                </div>
                            ))}

                               
                        </div>
                        )}

                 </div>


                </div>

                {/* COLUNA 2 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Digite quais itens estão disponíveis ao cliente
                    </Label>

                    {ITEM_VALUES.map(item => {
                            const isDark = theme === "dark"
                            const selected = selectedItems.find(i => i.item === item)

                            const isFoodWithSub = ITEMS_WITH_SUBCATEGORY.includes(item)

                            const isDrink = item === "Bebidas"

                            const subcategories = isFoodWithSub ? SUBCATEGORIES_VALUES : isDrink ? SUBCATEGORIES_DRINKS : null

                            return (
                                <div key={item}>
                                <Button
                                    type="button"
                                    className={clsx( 
                                         "justify-start rounded-xl h-12 m-2 border w-full transition-all duration-200",
                                            {
                                            
                                            "bg-orange-500 text-white border-orange-500 cursor-default":
                                                selected && !isDark,

                                            "bg-orange-500 text-white border-orange-400 cursor-default":
                                                selected && isDark,

                                            
                                            "bg-neutral-800 text-white hover:bg-orange-600/10 hover:text-orange-400 hover:border-orange-600":
                                                !selected && isDark,

                                            "bg-white text-black hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300":
                                                !selected && !isDark, })}
                                    onClick={() => itemSelect(item)}
                                >
                                    {selected ? (<><Check />{item}</>) : (<><Plus /> {item}</>)}
                                    
                                </Button>

                              {selected && subcategories && (
                                <div className="mt-3 space-y-2 pl-2">
                                    {subcategories.map(sub => {
                                    const selectedSub = selected.subcategories?.find(
                                        s => s.name === sub
                                    )

                                    return (
                                        <div key={sub} className="flex items-center gap-3">
                                        <Checkbox
                                            checked={!!selectedSub}
                                            onCheckedChange={() =>
                                            toggleSubcategory(item, sub)
                                            }
                                        />

                                        <span className="text-sm w-32">{sub}</span>

                                        {ativo && selectedSub && (
                                            <Input
                                            type="number"
                                            min={0}
                                            className="w-24"
                                            placeholder="Qtd"
                                            value={selectedSub.quantity ?? ""}
                                            onChange={e =>
                                                setSubcategoryQuantity(
                                                item,
                                                sub,
                                                Number(e.target.value)
                                                )
                                            }
                                            />
                                        )}
                                        </div>
                                    )
                                    })}
                                </div>
                                )}


                                </div>
                            )
                            })}

                         
                                          
                  </div>
                </div>
              </div>

              {/* BOTÃO DE SUBMIT */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)}