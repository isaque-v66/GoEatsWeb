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