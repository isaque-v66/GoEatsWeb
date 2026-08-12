"use client"

import { useState } from "react"
import { createOrder, sendOrder } from "../services/order.service"
import { ITEM_TO_MEAL_TYPE, ItemType } from "../constants/itemValues.constants"
import { Order } from "../types/order.types"
import { AppError } from "@/src/shared/errors/AppError"
import { isSameDay, parseISO } from "date-fns"

interface SubmitOrderParams {
  userId: string
  companyId: string
  orders: Order
}

type OrderItemType = Order["items"][number]
type OrderSubcategoryType = NonNullable<OrderItemType["subcategories"]>[number]


function isTodayDate(dateStr?: string): boolean {
  if (!dateStr) return true
  return isSameDay(parseISO(dateStr), new Date())
}

export function useSubmitOrder() {
  const [loading, setLoading] = useState(false)

  const submitOrder = async ({ userId, companyId, orders }: SubmitOrderParams) => {
    try {
      setLoading(true)

      const normalItems: OrderItemType[] = []
      const scheduledItems: OrderItemType[] = []

      for (const item of orders.items) {
        // Item sem subcategoria: a data está no próprio item
        if (!item.subcategories?.length) {
          const date = item.startDate ?? item.specificDate
          if (isTodayDate(date)) {
            normalItems.push(item)
          } else {
            scheduledItems.push(item)
          }
          continue
        }

        // Item com subcategorias: cada subcategoria pode ter sua própria data
        const todaySubs: OrderSubcategoryType[] = []
        const futureSubs: OrderSubcategoryType[] = []

        for (const sub of item.subcategories) {
          const date = sub.startDate ?? sub.specificDate ?? item.startDate ?? item.specificDate
          if (isTodayDate(date)) {
            todaySubs.push(sub)
          } else {
            futureSubs.push(sub)
          }
        }

        if (todaySubs.length > 0) {
          normalItems.push({ ...item, subcategories: todaySubs })
        }
        if (futureSubs.length > 0) {
          scheduledItems.push({ ...item, subcategories: futureSubs })
        }
      }

      const results: string[] = []

      // Pedidos normais (hoje)
      if (normalItems.length > 0) {
        const normalOrders = {
          ...orders,
          items: normalItems.map(item => ({
            ...item,
            mealType: ITEM_TO_MEAL_TYPE[item.item as ItemType],
          })),
        }

        const created = await createOrder({ userId, companyId, orders: normalOrders })
        await sendOrder(created.orderId)
        results.push("Pedido normal enviado")
      }

      // Pedidos agendados (dias futuros)
      if (scheduledItems.length > 0) {
        const scheduledOrders = {
          ...orders,
          items: scheduledItems.map(item => ({
            ...item,
            mealType: ITEM_TO_MEAL_TYPE[item.item as ItemType],
          })),
        }

        const res = await fetch("/api/orders/scheduled", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, companyId, orders: scheduledOrders }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new AppError(data.message ?? "Erro ao criar pedido especial")
        }

        const data = await res.json()
        results.push(`${data.count} pedido(s) especial(is) criado(s)`)
      }

      return {
        success: true,
        message: results.join(" · "),
      }
    } catch (error) {
      if (error instanceof AppError) {
        return { success: false, message: error.message }
      }
      return { success: false, message: "Erro inesperado ao enviar pedido." }
    } finally {
      setLoading(false)
    }
  }

  return { submitOrder, loading }
}