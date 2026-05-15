"use client"

import { useState } from "react"

import {
  createOrder,
  sendOrder,
} from "../services/order.service"

import {
  ITEM_TO_MEAL_TYPE,
  ItemType,
} from "../constants/itemValues.constants"

import { Order } from "../types/order.types"
import { AppError } from "@/src/shared/errors/AppError"

interface SubmitOrderParams {
  userId: string
  companyId: string
  orders: Order
}

export function useSubmitOrder() {
  const [loading, setLoading] =
    useState(false)

  const submitOrder = async ({
    userId,
    companyId,
    orders,
  }: SubmitOrderParams) => {
    try {
      setLoading(true)

      const ordersWithMealType = {
        ...orders,
        items: orders.items.map(
          (item) => ({
            ...item,
            mealType:
              ITEM_TO_MEAL_TYPE[
                item.item as ItemType
              ],
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