"use client"

import { useState } from "react"
import {
  ItemType,
  SubcategoryType
} from "../constants/itemValues.constants"

import {ScheduleType, OrderItem} from "../types/order.types"



type AddOrderPayload = {
  item: ItemType

  subcategory?: SubcategoryType

  quantity?: number

  scheduleType?: ScheduleType

  specificDate?: string

  updateDefault?: boolean
}

type OrderState = {
  items: OrderItem[]
}


export function useOrder() {
  const [orders, setOrders] = useState<OrderState>({
    items: []
    })

  
  const addOrder = ({
    item,
    subcategory,
    quantity = 1,
    scheduleType,
    specificDate,
    updateDefault = false,
  }: AddOrderPayload) => {
    setOrders(prev => ({
      items: [
        ...prev.items,
        subcategory
          ? {
              id: crypto.randomUUID(),
              item,
              scheduleType,
              specificDate,
              updateDefault,
              subcategories: [
                {
                  id: crypto.randomUUID(),
                  name: subcategory,
                  quantity,
                  scheduleType: scheduleType ?? "WEEKDAY",
                  specificDate,
                  updateDefault,
                },
              ],
            }
          : {
              id: crypto.randomUUID(),
              item,
              quantity,
              scheduleType,
              specificDate,
              updateDefault,
            },
      ],
    }))
  }




  const updateQuantity = (orderId: string, delta: number, subId?: string) => {
  setOrders(prev => {
    const items = prev.items.map(order => {
      if (order.id !== orderId) return order

      // ITEM SEM SUB
      if (!subId) {
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
          if (s.id !== subId) return s

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







  const removeItem = (orderId: string, subId?: string) => {
    setOrders(prev => {
      if (!subId) {
        return { items: prev.items.filter(o => o.id !== orderId) }
      }

      const items = prev.items
        .map(order => {
          if (order.id !== orderId) return order
          const filteredSubs = order.subcategories?.filter(s => s.id !== subId)
          if (!filteredSubs?.length) return null
          return { ...order, subcategories: filteredSubs }
        })
        .filter(Boolean) as typeof prev.items

      return { items }
    })
  }







  const updateScheduleType = (orderId: string, scheduleType: ScheduleType) => {
    setOrders(prev => ({
      items: prev.items.map(order =>
        order.id === orderId
          ? { ...order, scheduleType }
          : order
      )
    }))
  }
  


  
  const updateDefaultFlag = (orderId: string,value: boolean) => {
    setOrders(prev => ({
      items: prev.items.map(order =>
        order.id === orderId
          ? { ...order, updateDefault: value }
          : order
      )
    }))
  }
  


  
  const updateSpecificDate = (
    orderId: string,
    date?: string
  ) => {
    setOrders(prev => ({
      items: prev.items.map(order =>
        order.id === orderId
          ? {
              ...order,
              specificDate: date,
            }
          : order
      )
    }))
  }





  const updateSubScheduleType = (
  orderId: string,
  subId: string,
  scheduleType: ScheduleType
) => {
  setOrders(prev => ({
    items: prev.items.map(order => {
      if (order.id !== orderId) {
        return order
      }

      return {
        ...order,
        subcategories: order.subcategories?.map(sub =>
          sub.id === subId
            ? {
                ...sub,
                scheduleType,
              }
            : sub
        ),
      }
    }),
  }))
}



const updateSubDefaultFlag = (
  orderId: string,
  subId: string,
  value: boolean
) => {
  setOrders(prev => ({
    items: prev.items.map(order => {
      if (order.id !== orderId) {
        return order
      }

      return {
        ...order,
        subcategories: order.subcategories?.map(sub =>
          sub.id === subId
            ? {
                ...sub,
                updateDefault: value,
              }
            : sub
        ),
      }
    }),
  }))
}




const updateDateRange = (
  orderId: string,
  startDate?: string,
  endDate?: string,
  subId?: string
) => {
  setOrders(prev => ({
    items: prev.items.map(order => {
      if (order.id !== orderId) return order

      if (!subId) {
        return { ...order, startDate, endDate, specificDate: undefined }
      }

      return {
        ...order,
        subcategories: order.subcategories?.map(sub =>
          sub.id === subId
            ? { ...sub, startDate, endDate, specificDate: undefined }
            : sub
        ),
      }
    }),
  }))
}



 const clearOrders = () => {
    setOrders({ items: [] })
  }




  return {
    orders,
    addOrder,
    updateQuantity,
    removeItem,
    updateScheduleType,
    updateDefaultFlag,
    updateSpecificDate,
    updateSubScheduleType,
    updateSubDefaultFlag,
    updateDateRange,
    clearOrders
  }
}

