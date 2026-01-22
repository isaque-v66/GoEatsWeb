"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Utensils,
  Coffee,
  Sandwich,
  Plus,
  ShoppingCart,
  Moon,
  Beef,
  GlassWater,
  Cake,
} from "lucide-react"
import { OrderSummary } from "./order-summary"
import { Input } from "@/components/ui/input"
import { useTheme } from "../contexts/theme-context"
import { Header } from "./header"
import z from "zod"
import type { ReactNode } from "react"
import { useUser } from "../contexts/user-context"






/* TYPES */


const ITEM_VALUES = [
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

type AvailableItem = {
  name: ItemType
  mealType: MealType
  subcategories?: {
    name: SubcategoryType
    defaultQuantity?: number | null
  }[]
}



const ITEM_ICONS: Record<ItemType, ReactNode> = {
  Desjejum: <Coffee />,
  Almoço: <Beef />,
  Jantar: <Moon />,
  Ceia: <Utensils />,
  Lanche: <Sandwich />,
  Bebidas: <GlassWater />,
  "Café da tarde": <Cake />,
  "Café noturno": <Coffee />,
  Outros: <Plus />,
}



const MEAL_SCHEDULE: Record<MealType, { start: number; end: number }> = {
  DESJEJUM: { start: 0, end: 0 },
  ALMOCO: { start: 0, end: 0 },
  CAFE_TARDE: { start: 5, end: 8 },
  JANTAR: { start: 5, end: 9 },
  CEIA: { start: 5, end: 23 },
  CAFE_NOTURNO: { start: 23, end: 5 },
  LANCHE: { start: 0, end: 23 },
  BEBIDAS: { start: 19, end: 14 },
  FIM_SEMANA: { start: 0, end: 23 },
}


/* ORDER TYPES */


const OrderSchema = z.object({
  items: z.array(
    z.object({
      item: z.enum(ITEM_VALUES),
      quantity: z.number().optional(),
      subcategories: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.number(),
          })
        )
        .optional(),
    })
  ),
})

export type Order = z.infer<typeof OrderSchema>


export function DashboardContent() {
  const { theme } = useTheme()
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([])
  const [currentMeal, setCurrentMeal] = useState<MealType | null>(null)
  const [orders, setOrders] = useState<Order>({ items: [] })
  const [customOtherText, setCustomOtherText] = useState("")
  const { user, loading: isUserLoading } = useUser()
  

  useEffect(() => {
  // ainda carregando o usuário
  if (isUserLoading) return

  // sem usuário → limpa estado
  if (!user?.id) {
    setAvailableItems([])
    return
  }

  let cancelled = false

  async function loadItems() {
    try {
      // limpa antes de carregar (evita flash)
      setAvailableItems([])

      const res = await fetch(
        `/api/dashboard/items?userId=${user?.id}`,
        { cache: "no-store" }
      )

      if (!res.ok) return

      const json = await res.json()

      if (!cancelled) {
        setAvailableItems(json.items || [])
      }
    } catch (error) {
      console.error("Failed to load items:", error)
      if (!cancelled) {
        setAvailableItems([])
      }
    }
  }

  loadItems()

  return () => {
    cancelled = true
  }
}, [user?.id, isUserLoading])



  /* TIMER  */

  useEffect(() => {
    const update = () => setCurrentMeal(getCurrentMeal())
    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])





  function getCurrentMeal(): MealType | null {
    const hour = new Date().getHours()
    return (
      Object.entries(MEAL_SCHEDULE).find(([_, r]) =>
        r.start < r.end
          ? hour >= r.start && hour < r.end
          : hour >= r.start || hour < r.end
      )?.[0] as MealType | null
    )
  }






  function getRemainingTime(meal: MealType) {
    const now = new Date()
    let diff = MEAL_SCHEDULE[meal].end - now.getHours()
    if (diff < 0) diff += 24
    return `${diff}h ${59 - now.getMinutes()}m`
  }







  /* ORDER LOGIC  */

  const addOrder = (item: ItemType, sub?: SubcategoryType) => {
    setOrders(prev => {
      const items = [...prev.items]
      const index = items.findIndex(i => i.item === item)

      if (index === -1) {
        items.push(
          sub
            ? { item, subcategories: [{ name: sub, quantity: 1 }] }
            : { item, quantity: 1 }
        )
        return { items }
      }

      const current = items[index]

      if (!sub) {
        current.quantity = (current.quantity ?? 0) + 1
        return { items }
      }

      const subs = current.subcategories ?? []
      const s = subs.find(x => x.name === sub)
      s ? s.quantity++ : subs.push({ name: sub, quantity: 1 })
      current.subcategories = subs

      return { items }
    })
  }

  const updateQuantity = (item: ItemType, delta: number, sub?: SubcategoryType) => {
    setOrders(prev => {
      const items = [...prev.items]
      const index = items.findIndex(i => i.item === item)
      if (index === -1) return prev

      const current = items[index]

      if (!sub) {
        const q = (current.quantity ?? 0) + delta
        q <= 0 ? items.splice(index, 1) : (current.quantity = q)
        return { items }
      }

      const subs = current.subcategories ?? []
      const i = subs.findIndex(s => s.name === sub)
      if (i !== -1) {
        subs[i].quantity += delta
        if (subs[i].quantity <= 0) subs.splice(i, 1)
      }

      subs.length === 0 ? items.splice(index, 1) : (current.subcategories = subs)
      return { items }
    })
  }





  return (
  <div>
    <Header />

    <div className="container mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
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
            {availableItems.map(item => {
              const available = item.mealType === currentMeal

              return (
                <Card
                  key={item.name}
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
                        {ITEM_ICONS[item.name]}
                      </div>
                      <div>
                        <CardTitle className={`
                          text-xl font-semibold transition-colors duration-300
                          ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                        `}>
                          {item.name}
                        </CardTitle>
                        <p className="text-xs mt-1 text-orange-500">
                          {available
                            ? `Encerra em ${getRemainingTime(item.mealType)}`
                            : "Indisponível no momento"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 pb-6">
                    {item.subcategories?.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {item.subcategories.map(sub => (
                          <Button
                            key={sub.name}
                            variant="outline"
                            className={`
                              justify-start rounded-xl h-12 transition-all duration-200
                              ${theme === 'dark'
                                ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-orange-600 hover:bg-orange-600/10 hover:text-orange-400'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                              }
                            `}
                            disabled={!available}
                            onClick={() => addOrder(item.name, sub.name)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {sub.name}
                          </Button>
                        ))}
                      </div>
                    ) : item.name === "Outros" ? (
                      <div className="flex gap-3">
                        <Input
                          placeholder="Descreva seu pedido personalizado..."
                          value={customOtherText}
                          onChange={e => setCustomOtherText(e.target.value)}
                          className={`
                            h-12 rounded-xl border px-4 flex-1
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
                              addOrder("Outros")
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
                        disabled={!available}
                        onClick={() => addOrder(item.name)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar ao Pedido
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

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