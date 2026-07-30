"use client"

import { useState } from "react"
import { createOrder, sendOrder } from "../services/order.service"
import { ITEM_TO_MEAL_TYPE, ItemType } from "../constants/itemValues.constants"
import { Order } from "../types/order.types"
import { AppError } from "@/src/shared/errors/AppError"

interface SubmitOrderParams {
  userId: string
  companyId: string
  orders: Order
}

export function useSubmitOrder() {
  const [loading, setLoading] = useState(false)

  const submitOrder = async ({ userId, companyId, orders }: SubmitOrderParams) => {
    try {
      setLoading(true)

      // Separa itens com e sem data especial
      const normalItems = orders.items.filter(item => !item.startDate && !item.specificDate)
      const scheduledItems = orders.items.filter(item => !!item.startDate || !!item.specificDate)

      const results: string[] = []

      // Pedidos normais 
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

      // Pedidosespeciais (com data)
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