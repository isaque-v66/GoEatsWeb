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