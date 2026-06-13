"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Utensils, Coffee, Sandwich, Plus, ShoppingCart,
  Moon, Beef, GlassWater, Cake, X,
} from "lucide-react"
import { OrderSummary } from "./order-summary/order-summary"
import { useTheme } from "@/src/shared/contexts/theme-context"
import { Header } from "@/src/shared/components/header"
import z from "zod"
import type { ReactNode } from "react"
import { useUser } from "../../auth/contexts/user-context"
import { useOrder } from "../hooks/useOrders"
import { ITEM_VALUES, ItemType } from "../constants/itemValues.constants"
import { getRemainingTime, isMealAvailable } from "../utils/meal.utils"
import { useDashboardItems } from "../hooks/useDashboardItems"
import { ITEM_TO_MEAL_TYPE } from "../constants/itemValues.constants"

export const ITEM_ICONS: Record<ItemType, ReactNode> = {
  Desjejum: <Coffee className="w-5 h-5" />,
  Almoço: <Beef className="w-5 h-5" />,
  Jantar: <Moon className="w-5 h-5" />,
  Ceia: <Utensils className="w-5 h-5" />,
  Lanche: <Sandwich className="w-5 h-5" />,
  Bebidas: <GlassWater className="w-5 h-5" />,
  "Café da tarde": <Cake className="w-5 h-5" />,
  "Café noturno": <Coffee className="w-5 h-5" />,
}

const OrderSchema = z.object({
  items: z.array(
    z.object({
      item: z.enum(ITEM_VALUES),
      quantity: z.number().optional(),
      subcategories: z.array(z.object({ name: z.string(), quantity: z.number() })).optional(),
    })
  ),
})

export type Order = z.infer<typeof OrderSchema>

export function DashboardContent() {
  const { theme } = useTheme()
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  const { orders, addOrder, updateQuantity, removeItem, updateScheduleType,
    updateDefaultFlag, updateSubScheduleType, updateSubDefaultFlag, updateDateRange } = useOrder()
  const { user } = useUser()
  const { items: availableItems, loading } = useDashboardItems(user?.id)

  const isDark = theme === "dark"

  const totalItems = orders.items.reduce((sum, order) => {
    if (order.subcategories?.length) {
      return sum + order.subcategories.reduce((s, sub) => s + sub.quantity, 0)
    }
    return sum + (order.quantity ?? 0)
  }, 0)

  const orderSummaryProps = {
    orders,
    onUpdateQuantity: updateQuantity,
    onRemoveItem: removeItem,
    onUpdateScheduleType: updateScheduleType,
    onUpdateDefaultFlag: updateDefaultFlag,
    onUpdateSubScheduleType: updateSubScheduleType,
    onUpdateSubDefaultFlag: updateSubDefaultFlag,
    updateDateRange: updateDateRange
    
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-neutral-950" : "bg-neutral-50"}`}>
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          
          <div className="lg:col-span-2 space-y-6">

            
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
                Faça seu pedido
              </h2>
              <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                Selecione a refeição e adicione ao carrinho
              </p>
            </div>

            
            <div className="space-y-3">
              {availableItems.map(item => {
                const mealType = ITEM_TO_MEAL_TYPE[item.name]
                const available = isMealAvailable(mealType)
                const remainingTime = getRemainingTime(mealType)
                const isEncerrado = remainingTime === "Encerrado"

                return (
                  <Card
                    key={item.name}
                    className={`
                      overflow-hidden transition-all duration-200
                      ${isDark
                        ? "border-neutral-800 bg-neutral-900"
                        : "border-neutral-200 bg-white shadow-sm"
                      }
                      ${!available ? "opacity-60" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Ícone */}
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                        ${isDark
                          ? "bg-orange-600/15 text-orange-400"
                          : "bg-orange-50 text-orange-500"
                        }
                      `}>
                        {ITEM_ICONS[item.name]}
                      </div>

                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isDark ? "text-white" : "text-neutral-900"}`}>
                          {item.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${isEncerrado ? "text-neutral-400" : "text-orange-500"}`}>
                          {isEncerrado ? "Indisponível agora" : `Encerra em ${remainingTime}`}
                        </p>
                      </div>

                      
                      {!item.subcategories?.length && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!available}
                          onClick={() => addOrder({ item: item.name })}
                          className={`
                            shrink-0 h-8 px-3 text-xs font-medium transition-colors
                            ${isDark
                              ? "border-neutral-700 text-neutral-300 hover:border-orange-600 hover:text-orange-400 hover:bg-orange-600/10"
                              : "border-neutral-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
                            }
                          `}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>

                    
                    {item.subcategories?.length ? (
                      <div className={`
                        px-4 pb-3 pt-1 border-t flex flex-wrap gap-2
                        ${isDark ? "border-neutral-800" : "border-neutral-100"}
                      `}>
                        {item.subcategories.map(sub => (
                          <Button
                            key={sub.name}
                            size="sm"
                            variant="outline"
                            disabled={!available}
                            onClick={() => addOrder({ item: item.name, subcategory: sub.name })}
                            className={`
                              h-8 px-3 text-xs font-medium transition-colors
                              ${isDark
                                ? "border-neutral-700 text-neutral-300 hover:border-orange-600 hover:text-orange-400 hover:bg-orange-600/10"
                                : "border-neutral-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50"
                              }
                            `}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {sub.name}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </Card>
                )
              })}
            </div>
          </div>

          
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">
              <OrderSummary
                orders={orders}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onUpdateScheduleType={updateScheduleType}
                onUpdateDefaultFlag={updateDefaultFlag}
                onUpdateSubScheduleType={updateSubScheduleType}
                onUpdateSubDefaultFlag={updateSubDefaultFlag}
                onUpdateDateRange={updateDateRange}  
              />
            </div>
          </div>

        </div>
      </div>

      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        {orders.items.length > 0 ? (
          <Button
            className="w-full h-12 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all"
            onClick={() => setMobileCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ver carrinho
            <span className="ml-2 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </Button>
        ) : (
          <div className={`
            w-full h-12 rounded-xl flex items-center justify-center text-sm border border-dashed
            ${isDark ? "border-neutral-700 text-neutral-500" : "border-neutral-200 text-neutral-400"}
          `}>
            Nenhum item no carrinho
          </div>
        )}
      </div>

      
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileCartOpen(false)}
          />

          
          <div className={`
            relative rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden
            ${isDark ? "bg-neutral-900 border-t border-neutral-800" : "bg-white border-t border-neutral-200"}
          `}>
            
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-neutral-900"}`}>
                Seu carrinho
              </p>
              <button
                onClick={() => setMobileCartOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            
            <div className="overflow-y-auto flex-1">
              <OrderSummary
                orders={orders}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onUpdateScheduleType={updateScheduleType}
                onUpdateDefaultFlag={updateDefaultFlag}
                onUpdateSubScheduleType={updateSubScheduleType}
                onUpdateSubDefaultFlag={updateSubDefaultFlag}
                onUpdateDateRange={updateDateRange}  
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}