"use client"

import { useState } from "react"
import {
  createOrder,
  sendOrder,
} from "../services/order.service"

import { ITEM_TO_MEAL_TYPE } from "../constants/itemValues.constants"
import { AppError } from "@/src/shared/errors/AppError"

export function useSubmitOrder() {
  const [loading, setLoading] =
    useState(false)

  const submitOrder = async ({
    userId,
    companyId,
    orders,
  }: any) => {
    try {
      setLoading(true)

      const ordersWithMealType = {
        ...orders,
        items: orders.items.map(
          (item: any) => ({
            ...item,
            mealType:
              ITEM_TO_MEAL_TYPE[item.item],
          })
        ),
      }

      const created =
        await createOrder({
          userId,
          companyId,
          orders: ordersWithMealType,
        })

      await sendOrder(created.orderId)

      return {
        success: true,
        message:
          "Pedido enviado com sucesso!",
      }
    } catch (error) {
      if (error instanceof AppError) {
        return {
          success: false,
          message: error.message,
        }
      }

      return {
        success: false,
        message:
          "Erro inesperado ao enviar pedido.",
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    submitOrder,
    loading,
  }
}