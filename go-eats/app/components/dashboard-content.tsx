"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, LogOut, Coffee, Sandwich, Pizza, Cookie, Plus, ShoppingCart } from "lucide-react"
import { OrderSummary } from "./order-summary"
import { Input } from "@/components/ui/input"

interface OrderItem {
  category: string
  subcategory?: string
  quantity: number
  customText?: string
}

export function DashboardContent() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [customOtherText, setCustomOtherText] = useState("")

  const mainCategories = [
    {
      name: "Almoço",
      icon: Coffee,
      subcategories: ["Granel", "MTX8", "MTX9", "Divisional"],
    },
    {
      name: "Ceia",
      icon: Sandwich,
      subcategories: ["Granel", "MTX8", "MTX9", "Divisional"],
    },
    {
      name: "Jantar",
      icon: Pizza,
      subcategories: ["Granel", "MTX8", "MTX9", "Divisional"],
    },
    { name: "Lanche", icon: Cookie, subcategories: [] },
    { name: "Café da tarde", icon: Coffee, subcategories: [] },
    { name: "Café da manhã", icon: Coffee, subcategories: [] },
    { name: "Litro de leite", icon: Coffee, subcategories: [] },
    { name: "Café com leite", icon: Coffee, subcategories: [] },
    { name: "Completo de refeição", icon: Utensils, subcategories: [] },
  ]

  const addOrder = (category: string, subcategory?: string, customText?: string) => {
    const existingOrderIndex = orders.findIndex(
      (order) => order.category === category && order.subcategory === subcategory && order.customText === customText,
    )

    if (existingOrderIndex >= 0) {
      const newOrders = [...orders]
      newOrders[existingOrderIndex].quantity += 1
      setOrders(newOrders)
    } else {
      setOrders([...orders, { category, subcategory, quantity: 1, customText }])
    }
  }

  const updateQuantity = (index: number, delta: number) => {
    const newOrders = [...orders]
    newOrders[index].quantity = Math.max(0, newOrders[index].quantity + delta)

    if (newOrders[index].quantity === 0) {
      newOrders.splice(index, 1)
    }

    setOrders(newOrders)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
  {/* Header */}
  <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-sm shadow-sm">
    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
          <Utensils className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Go Eats</h1>
          <p className="text-sm text-neutral-500">Sistema de pedidos de comida</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-neutral-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl px-4 py-2 transition-colors duration-200"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </div>
  </header>

  <div className="container mx-auto px-6 py-8">
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Order Selection */}
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Faça seu pedido</h2>
          <p className="text-neutral-500 text-lg">Selecione o tipo de refeição e a quantidade</p>
        </div>

        <div className="grid gap-6">
          {mainCategories.map((category) => (
            <Card
              key={category.name}
              className="overflow-hidden border border-neutral-200 bg-white rounded-2xl shadow-md shadow-neutral-100/50 hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-neutral-50 to-white pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl flex items-center justify-center border border-orange-100">
                    <category.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-neutral-900">{category.name}</CardTitle>
                    {/* {category.description && (
                      <p className="text-sm text-neutral-500 mt-1">{}</p>
                    )} */}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-6">
                {category.subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {category.subcategories.map((sub) => (
                      <Button
                        key={sub}
                        variant="outline"
                        className="justify-start bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 rounded-xl h-12 transition-all duration-200"
                        onClick={() => addOrder(category.name, sub)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {sub}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto justify-start bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 rounded-xl h-12 transition-all duration-200"
                    onClick={() => addOrder(category.name)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                   Adicionar ao Pedido
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Others - Editable Field */}
          <Card className="overflow-hidden border border-neutral-200 bg-white rounded-2xl shadow-md shadow-neutral-100/50">
            <CardHeader className="bg-gradient-to-r from-neutral-50 to-white pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl flex items-center justify-center border border-orange-100">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-neutral-900">Outros</CardTitle>
                  <CardDescription className="text-neutral-500">Especifique seu pedido personalizado</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter custom order..."
                  value={customOtherText}
                  onChange={(e) => setCustomOtherText(e.target.value)}
                  className="
                    h-12 rounded-xl border border-neutral-200 bg-white px-4
                    text-neutral-900 placeholder-neutral-400
                    transition-all duration-200
                    focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20
                    focus:outline-none focus:shadow-sm
                    hover:border-neutral-300
                  "
                />
                <Button
                  onClick={() => {
                    if (customOtherText.trim()) {
                      addOrder("Others", undefined, customOtherText)
                      setCustomOtherText("")
                    }
                  }}
                  disabled={!customOtherText.trim()}
                  className="
                    h-12 px-6 rounded-xl
                    bg-gradient-to-r from-orange-500 to-orange-600
                    text-white font-medium
                    transition-all duration-300
                    hover:from-orange-600 hover:to-orange-700
                    hover:shadow-lg hover:shadow-orange-200
                    active:scale-[0.98]
                    focus:outline-none focus:ring-3 focus:ring-orange-500/40
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
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
          <div className="border border-neutral-200 bg-white rounded-2xl shadow-xl shadow-neutral-200/50 overflow-hidden">
            <OrderSummary orders={orders} onUpdateQuantity={updateQuantity} />
          </div>
          
          {/* Action Button */}
          <Button
            className="
              w-full mt-6 h-14 rounded-xl
              bg-gradient-to-r from-orange-500 to-orange-600
              text-white font-semibold text-lg
              transition-all duration-300
              hover:from-orange-600 hover:to-orange-700
              hover:shadow-xl hover:shadow-orange-200
              active:scale-[0.98]
              focus:outline-none focus:ring-4 focus:ring-orange-500/30
            "
            onClick={() => console.log('Order placed!')}
            disabled={orders.length === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            Fazer Pedido
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
