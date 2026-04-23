"use client"

import { useState } from "react"
import { ItemType, SubcategoryType } from "../constants/itemValues.constants"



type OrderItem = {
  item: ItemType
  quantity?: number
  subcategories?: {
    name: SubcategoryType
    quantity: number
  }[]
}

type OrderState = {
  items: OrderItem[]
}


export function useOrder() {
  const [orders, setOrders] = useState<OrderState>({
    items: []
    })

  
const addOrder = (item: ItemType, sub?: SubcategoryType) => {
    setOrders(prev => {
    const index = prev.items.findIndex(i => i.item === item)

    if (index === -1) {
      return {
        items: [
          ...prev.items,
          sub
            ? { item, subcategories: [{ name: sub, quantity: 1 }] }
            : { item, quantity: 1 }
        ]
      }
    }

    return {
      items: prev.items.map((i, idx) => {
        if (idx !== index) return i

        if (!sub) {
          return {
            ...i,
            quantity: (i.quantity ?? 0) + 1
          }
        }

        const existingSub = i.subcategories?.find(s => s.name === sub)

        return {
          ...i,
          subcategories: existingSub
            ? i.subcategories!.map(s =>
                s.name === sub
                  ? { ...s, quantity: s.quantity + 1 }
                  : s
              )
            : [...(i.subcategories ?? []), { name: sub, quantity: 1 }]
        }
      })
    }
  })
}




  const updateQuantity = (
  item: ItemType,
  delta: number,
  sub?: SubcategoryType
) => {
  setOrders(prev => {
    const items = prev.items.map(order => {
      if (order.item !== item) return order

      // ITEM SEM SUB
      if (!sub) {
        const newQuantity = (order.quantity ?? 0) + delta

        if (newQuantity <= 0) return null

        return {
          ...order,
          quantity: newQuantity,
        }
      }

      // ITEM COM SUB
      const updatedSubs = (order.subcategories ?? [])
        .map(s => {
          if (s.name !== sub) return s

          const newQ = s.quantity + delta
          if (newQ <= 0) return null

          return { ...s, quantity: newQ }
        })
        .filter(Boolean) as typeof order.subcategories

      if (!updatedSubs?.length) return null

      return {
        ...order,
        subcategories: updatedSubs,
      }
    }).filter(Boolean) as typeof prev.items

    return { items }
  })
}

  const removeItem = (item: ItemType, sub?: SubcategoryType) => {
    updateQuantity(item, -9999, sub)
  }


  return {
    orders,
    addOrder,
    updateQuantity,
    removeItem
  }
}