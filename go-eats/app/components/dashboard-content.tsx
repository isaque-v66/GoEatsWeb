"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, LogOut, Coffee, Sandwich, Pizza, Cookie, Plus, ShoppingCart } from "lucide-react"
import { OrderSummary } from "./order-summary"
import { Input } from "@/components/ui/input"
import { useTheme } from "../contexts/theme-context"
import { Header } from "./header"
import z from "zod"
import { useFormData } from "../contexts/formRegister-context"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"




const ITEM_VALUES = [
  "Desjejum",
  "Almoço",
  "Jantar",
  "Ceia",
  "Lanche",
  "Bebidas",
  "Café da tarde",
  "Café noturno",
  "Outros"
] as const

export type ItemType = (typeof ITEM_VALUES)[number]

const FOOD_SUBCATEGORIES = [
  "Granel",
  "MTX8",
  "MTX9",
  "Divisional",
] as const

type FoodSubcategory = (typeof FOOD_SUBCATEGORIES)[number]

const DRINK_SUBCATEGORIES = [
  "Achocolatado",
  "Litro de leite",
  "Litro de café",
  "Litro de chá",
] as const

type DrinkSubcategory = (typeof DRINK_SUBCATEGORIES)[number]

export type SubcategoryType = FoodSubcategory | DrinkSubcategory


const ITEMS_WITH_SUBCATEGORY: ItemType[] = ["Almoço", "Ceia", "Jantar"]













// SCHEMA ZOD

const SubcategorySchema = z.object({
   name: z.union([
    z.enum(FOOD_SUBCATEGORIES),
    z.enum(DRINK_SUBCATEGORIES),
  ]),
  quantity: z.number().int().positive(),
})



const OrderItemSchema = z.object({
  item: z.enum(ITEM_VALUES),
  quantity: z.number().int().positive().optional(),
  subcategories: z.array(SubcategorySchema).optional(),
})



const OrderSchema = z.object({
  items: z.array(OrderItemSchema),
  customText: z.string().max(100).optional(),
})




export type Order = z.infer<typeof OrderSchema>
type OrderItem = z.infer<typeof OrderItemSchema>





export function DashboardContent() {
  const [orders, setOrders] = useState<Order>({items: []})
  const [customOtherText, setCustomOtherText] = useState("")
  const {theme, toggleTheme} = useTheme()
  const {data, setData, clearData} = useFormData()
  const {setValue} = useForm({
    resolver: zodResolver(OrderSchema)
  })





  const addOrder = (item: ItemType, subcategory?: SubcategoryType, customText?: string) => {
    
    setOrders(prev => {
        const items = [...prev.items]

        const itemIndex = items.findIndex(i => i.item === item)


        //Se o item não existe
       if(itemIndex <= -1) {
        items.push({
            item,
            subcategories: subcategory ? [{name: subcategory, quantity: 1}] : undefined,
            quantity: subcategory ? undefined : 1
        })

        return {...prev, items}
       }




       //Itens sem subcategoria

       const currentItem = items[itemIndex]


       if(!subcategory) {
         items.push({
            ...currentItem,
            quantity: (currentItem.quantity ?? 0) + 1
            
         })

         return {...prev, items}

       }
     



       //Item com subcategoria

        const subcategories = [...(currentItem.subcategories ?? [])]

        const subIndex = subcategories.findIndex(
        s => s.name === subcategory
        )

        if (subIndex === -1) {
        subcategories.push({
            name: subcategory,
            quantity: 1,
        })
        } else {
        subcategories[subIndex] = {
            ...subcategories[subIndex],
            quantity: subcategories[subIndex].quantity + 1,
        }
        }

        items[itemIndex] = {
        ...currentItem,
        subcategories,
        }

        return { ...prev, items }


    })



  }





 const updateQuantity = (item: ItemType, delta: number, subcategory?: SubcategoryType) => {
  setOrders(prev => {
    const items = [...prev.items]
    const itemIndex = items.findIndex(i => i.item === item)

    // ITEM NÃO EXISTE : CRIA
    if (itemIndex === -1) {
      if (subcategory) {
        items.push({
          item,
          subcategories: [{ name: subcategory, quantity: 1 }],
        })
      } else {
        items.push({
          item,
          quantity: 1,
        })
      }

      return { ...prev, items }
    }

    const currentItem = items[itemIndex]




    // ITEM SEM SUBCATEGORIA
    if (!subcategory) {
      const newQty = (currentItem.quantity ?? 0) + delta

      if (newQty <= 0) {
        items.splice(itemIndex, 1)
      } else {
        items[itemIndex] = {
          ...currentItem,
          quantity: newQty,
        }
      }

      return { ...prev, items }
    }

    // ITEM COM SUBCATEGORIA
    const subs = currentItem.subcategories ?? []
    const subIndex = subs.findIndex(s => s.name === subcategory)

    if (subIndex === -1 && delta > 0) {
      subs.push({ name: subcategory, quantity: 1 })
    } else if (subIndex !== -1) {
      const newQty = subs[subIndex].quantity + delta

      if (newQty <= 0) {
        subs.splice(subIndex, 1)
      } else {
        subs[subIndex].quantity = newQty
      }
    }

    // Se não sobrou nenhuma subcategoria, remove o item
    if (subs.length === 0) {
      items.splice(itemIndex, 1)
    } else {
      items[itemIndex] = {
        ...currentItem,
        subcategories: subs,
      }
    }

    return { ...prev, items }
  })
}









 return (
    <div>
        <Header />

        <div className="container mx-auto px-6 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Order Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-2">
                        <h2 className={`
                            text-3xl font-bold tracking-tight transition-colors duration-300
                            ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                        `}>
                            Faça seu pedido
                        </h2>
                        <p className={`
                            text-lg transition-colors duration-300
                            ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}
                        `}>
                            Selecione o tipo de refeição e a quantidade
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {ITEM_VALUES.map((itemName) => (
                            <Card
                                key={itemName}
                                className={`
                                    overflow-hidden rounded-2xl transition-all duration-300
                                    ${theme === 'dark'
                                        ? 'border border-neutral-800 bg-neutral-900 shadow-black/40 hover:shadow-black/60'
                                        : 'border border-neutral-200 bg-white shadow-md shadow-neutral-100/50 hover:shadow-lg hover:shadow-neutral-200/50'
                                    }
                                `}
                            >
                                <CardHeader className={`
                                    pb-4 transition-colors duration-300
                                    ${theme === 'dark'
                                        ? 'bg-gradient-to-r from-neutral-900 to-neutral-800'
                                        : 'bg-gradient-to-r from-neutral-50 to-white'
                                    }
                                `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300
                                            ${theme === 'dark'
                                                ? 'bg-gradient-to-br from-orange-600/20 to-orange-700/20 border-orange-800'
                                                : 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-100'
                                            }
                                        `}>
                                            {/* <category.icon className={`
                                                w-6 h-6 transition-colors duration-300
                                                ${theme === 'dark' ? 'text-orange-500' : 'text-orange-600'}
                                            `} /> */}
                                        </div>
                                        <div>
                                            <CardTitle className={`
                                                text-xl font-semibold transition-colors duration-300
                                                ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                                            `}>
                                                {itemName}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4 pb-6">
                                    {itemName.length > 0 && ITEMS_WITH_SUBCATEGORY.includes(itemName) ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {FOOD_SUBCATEGORIES.map((sub) => (
                                                <Button
                                                    key={sub}
                                                    variant="outline"
                                                    className={`
                                                        justify-start rounded-xl h-12 transition-all duration-200
                                                        ${theme === 'dark'
                                                            ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-orange-600 hover:bg-orange-600/10 hover:text-orange-400'
                                                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                                                        }
                                                    `}
                                                    onClick={() => addOrder(itemName, sub)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    {sub}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : itemName === "Bebidas" ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {DRINK_SUBCATEGORIES.map((sub) => (
                                                <Button
                                                    key={sub}
                                                    variant="outline"
                                                    className={`
                                                        justify-start rounded-xl h-12 transition-all duration-200
                                                        ${theme === 'dark'
                                                            ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-orange-600 hover:bg-orange-600/10 hover:text-orange-400'
                                                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                                                        }
                                                    `}
                                                    onClick={() => addOrder(itemName, sub)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    {sub}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className={`
                                                w-full sm:w-auto justify-start rounded-xl h-12 transition-all duration-200
                                                ${theme === 'dark'
                                                    ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-orange-600 hover:bg-orange-600/10 hover:text-orange-400'
                                                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                                                }
                                            `}
                                            onClick={() => addOrder(itemName)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar ao Pedido
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Others */}
                        <Card className={`
                            overflow-hidden rounded-2xl transition-all duration-300
                            ${theme === 'dark'
                                ? 'border border-neutral-800 bg-neutral-900 shadow-black/40'
                                : 'border border-neutral-200 bg-white shadow-md shadow-neutral-100/50'
                            }
                        `}>
                            <CardHeader className={`
                                pb-4 transition-colors duration-300
                                ${theme === 'dark'
                                    ? 'bg-gradient-to-r from-neutral-900 to-neutral-800'
                                    : 'bg-gradient-to-r from-neutral-50 to-white'
                                }
                            `}>
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-300
                                        ${theme === 'dark'
                                            ? 'bg-gradient-to-br from-orange-600/20 to-orange-700/20 border-orange-800'
                                            : 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-100'
                                        }
                                    `}>
                                        <Utensils className={`
                                            w-6 h-6 transition-colors duration-300
                                            ${theme === 'dark' ? 'text-orange-500' : 'text-orange-600'}
                                        `} />
                                    </div>
                                    <div>
                                        <CardTitle className={`
                                            text-xl font-semibold transition-colors duration-300
                                            ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                                        `}>
                                            Outros
                                        </CardTitle>
                                        <CardDescription className={`
                                            transition-colors duration-300
                                            ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}
                                        `}>
                                            Especifique seu pedido personalizado
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 pb-6">
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Enter custom order..."
                                        value={customOtherText}
                                        onChange={(e) => setCustomOtherText(e.target.value)}
                                        className={`
                                            h-12 rounded-xl border px-4
                                            transition-all duration-200
                                            placeholder-neutral-400
                                            focus:ring-3 focus:outline-none focus:shadow-sm
                                            ${theme === 'dark'
                                                ? 'bg-neutral-800 border-neutral-700 text-white ' +
                                                'focus:border-orange-500 focus:ring-orange-500/20 ' +
                                                'hover:border-neutral-600'
                                                : 'bg-white border-neutral-200 text-neutral-900 ' +
                                                'focus:border-orange-500 focus:ring-orange-500/20 ' +
                                                'hover:border-neutral-300'
                                            }
                                        `}
                                    />
                                    <Button
                                        onClick={() => {
                                            if (customOtherText.trim()) {
                                                addOrder("Outros", undefined, customOtherText)
                                                setCustomOtherText("")
                                            }
                                        }}
                                        disabled={!customOtherText.trim()}
                                        className={`
                                            h-12 px-6 rounded-xl font-medium
                                            transition-all duration-300
                                            hover:shadow-lg active:scale-[0.98]
                                            focus:outline-none focus:ring-3
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${theme === 'dark'
                                                ? 'bg-gradient-to-r from-orange-600 to-orange-700 ' +
                                                'text-white hover:from-orange-700 hover:to-orange-800 ' +
                                                'hover:shadow-orange-900/30 focus:ring-orange-600/40'
                                                : 'bg-gradient-to-r from-orange-500 to-orange-600 ' +
                                                'text-white hover:from-orange-600 hover:to-orange-700 ' +
                                                'hover:shadow-orange-200 focus:ring-orange-500/40'
                                            }
                                        `}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicione
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>






                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <div className={`
                            rounded-2xl shadow-xl overflow-hidden transition-all duration-300
                            ${theme === 'dark'
                                ? 'border border-neutral-800 bg-neutral-900 shadow-black/40'
                                : 'border border-neutral-200 bg-white shadow-neutral-200/50'
                            }
                        `}>
                            <OrderSummary orders={orders} onUpdateQuantity={updateQuantity} />
                        </div>
                        
                        {/* Action Button */}
                        <Button
                            className={`
                                w-full mt-6 h-14 rounded-xl font-semibold text-lg
                                transition-all duration-300
                                hover:shadow-xl active:scale-[0.98]
                                focus:outline-none focus:ring-4
                                ${theme === 'dark'
                                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 ' +
                                    'text-white hover:from-orange-700 hover:to-orange-800 ' +
                                    'hover:shadow-orange-900/40 focus:ring-orange-600/30'
                                    : 'bg-gradient-to-r from-orange-500 to-orange-600 ' +
                                    'text-white hover:from-orange-600 hover:to-orange-700 ' +
                                    'hover:shadow-orange-200 focus:ring-orange-500/30'
                                }
                            `}
                            onClick={() => console.log('Order placed!')}
                            disabled={orders.items.length === 0}
                        >
                            <ShoppingCart className="w-5 h-5 mr-3" />
                            Fazer Pedido
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}