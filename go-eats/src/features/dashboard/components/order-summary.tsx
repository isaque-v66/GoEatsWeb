"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { ItemType, SubcategoryType } from "../constants/itemValues.constants"
import { OrderItem, Order } from "../types/order.types"
import { useState } from "react"

interface OrderSummaryProps {
  orders: Order
  onUpdateQuantity: (
    item: ItemType,
    delta: number,
    subcategory?: SubcategoryType
  ) => void
  onRemoveItem: (item: ItemType, sub?: SubcategoryType) => void
}

export function OrderSummary({ orders, onUpdateQuantity, onRemoveItem }: OrderSummaryProps) {
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({})

  const totalItems = orders.items.reduce((sum, order) => {
    if (order.subcategories?.length) {
      return (
        sum +
        order.subcategories.reduce(
          (subSum, sub) => subSum + (sub.quantity ?? 0),
          0
        )
      )
    }
    return sum + (order.quantity ?? 0)
  }, 0)

  const handleSubmit = () => {
    alert("Order submitted successfully!")
    console.log("Orders:", orders)
  }

  const handleQuantityChange = (
    item: ItemType,
    value: string,
    subcategory?: SubcategoryType
  ) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      const currentQuantity = getCurrentQuantity(item, subcategory)
      const delta = numValue - currentQuantity
      if (delta !== 0) {
        onUpdateQuantity(item, delta, subcategory)
      }
    }
    // Limpar o estado de edição após aplicar
    const key = subcategory ? `${item}-${subcategory}` : `${item}`
    setEditingValues(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  const getCurrentQuantity = (item: ItemType, subcategory?: SubcategoryType): number => {
    const orderItem = orders.items.find(o => o.item === item)
    if (!orderItem) return 0
    
    if (subcategory && orderItem.subcategories) {
      const sub = orderItem.subcategories.find(s => s.name === subcategory)
      return sub?.quantity ?? 0
    }
    
    return orderItem.quantity ?? 0
  }

  const startEditing = (
    item: ItemType,
    currentValue: number,
    subcategory?: SubcategoryType
  ) => {
    const key = subcategory ? `${item}-${subcategory}` : `${item}`
    setEditingValues(prev => ({ ...prev, [key]: currentValue.toString() }))
  }

  const getEditingValue = (item: ItemType, subcategory?: SubcategoryType): string | undefined => {
    const key = subcategory ? `${item}-${subcategory}` : `${item}`
    return editingValues[key]
  }

  const handleIncrement = (item: ItemType, subcategory?: SubcategoryType) => {
    onUpdateQuantity(item, 1, subcategory)
  }

  const handleDecrement = (item: ItemType, subcategory?: SubcategoryType) => {
    onUpdateQuantity(item, -1, subcategory)
  }

  const handleRemove = (item: ItemType, subcategory?: SubcategoryType) => {
    onRemoveItem(item, subcategory)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Resumo do Pedido
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Badge>
        </div>
        <CardDescription>Revise seu pedido antes de enviar</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.items.map((order, index) => (
          <div key={`${order.item}-${index}`} className="p-3 border rounded-lg bg-muted/30 space-y-2">
            <p className="font-medium text-sm">{order.item}</p>

            {/* ITEM SEM SUBCATEGORIA */}
            {!order.subcategories && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecrement(order.item)}
                  type="button"
                >
                  <Minus className="w-3 h-3" />
                </Button>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={getEditingValue(order.item) ?? (order.quantity ?? 0)}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^\d+$/.test(value)) {
                      const key = `${order.item}`
                      setEditingValues(prev => ({ ...prev, [key]: value }))
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value
                    if (value !== '') {
                      handleQuantityChange(order.item, value)
                    } else {
                      const key = `${order.item}`
                      setEditingValues(prev => {
                        const newState = { ...prev }
                        delete newState[key]
                        return newState
                      })
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      if (input.value !== '') {
                        handleQuantityChange(order.item, input.value)
                      }
                      input.blur()
                    }
                  }}
                  className="w-12 text-center border rounded px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(order.item)}
                  type="button"
                >
                  <Plus className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleRemove(order.item)}
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* ITEM COM SUBCATEGORIAS */}
            {order.subcategories?.map(sub => (
              <div
                key={sub.name}
                className="flex items-center justify-between gap-2 pl-3"
              >
                <span className="text-xs">{sub.name}</span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecrement(order.item, sub.name)}
                    type="button"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={getEditingValue(order.item, sub.name) ?? (sub.quantity ?? 0)}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^\d+$/.test(value)) {
                        const key = `${order.item}-${sub.name}`
                        setEditingValues(prev => ({ ...prev, [key]: value }))
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value !== '') {
                        handleQuantityChange(order.item, value, sub.name)
                      } else {
                        const key = `${order.item}-${sub.name}`
                        setEditingValues(prev => {
                          const newState = { ...prev }
                          delete newState[key]
                          return newState
                        })
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value !== '') {
                          handleQuantityChange(order.item, input.value, sub.name)
                        }
                        input.blur()
                      }
                    }}
                    className="w-12 text-center border rounded px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleIncrement(order.item, sub.name)}
                    type="button"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleRemove(order.item, sub.name)}
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
      {orders.items.length > 0 && (
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Enviar Pedido
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}