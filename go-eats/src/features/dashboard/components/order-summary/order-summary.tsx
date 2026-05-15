"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { ItemType, SubcategoryType } from "../../constants/itemValues.constants"
import { Order } from "../../types/order.types"

import { useUser } from "@/src/features/auth/contexts/user-context"

import { useSubmitOrder } from "../../hooks/useSubmitOrder"

import { QuantityInput } from "./quantity-input"
import { SubmitOrderButton } from "./submit-order-button"
import { Button } from "@/components/ui/button"

interface OrderSummaryProps {
  orders: Order

  onUpdateQuantity: (
    item: ItemType,
    delta: number,
    subcategory?: SubcategoryType
  ) => void

  onRemoveItem: (
    item: ItemType,
    sub?: SubcategoryType
  ) => void
}

export function OrderSummary({
  orders,
  onUpdateQuantity,
  onRemoveItem,
}: OrderSummaryProps) {
  const { user } = useUser()

  const { submitOrder, loading } =
    useSubmitOrder()

  const [editingValues, setEditingValues] =
    useState<Record<string, string>>({})

  const totalItems = orders.items.reduce(
    (sum, order) => {
      if (order.subcategory?.length) {
        return (
          sum +
          order.subcategory.reduce(
            (subSum, sub) =>
              subSum + sub.quantity,
            0
          )
        )
      }

      return sum + (order.quantity ?? 0)
    },
    0
  )

  const handleSubmit = async () => {
    const result = await submitOrder({
      userId: user?.id,
      companyId: user?.companyId,
      orders,
    })

    alert(result.message)
  }

  const getCurrentQuantity = (
    item: ItemType,
    subcategory?: SubcategoryType
  ): number => {
    const orderItem = orders.items.find(
      o => o.item === item
    )

    if (!orderItem) return 0

    if (
      subcategory &&
      orderItem.subcategory
    ) {
      const sub =
        orderItem.subcategory.find(
          s => s.name === subcategory
        )

      return sub?.quantity ?? 0
    }

    return orderItem.quantity ?? 0
  }

  const clearEditingState = (
    item: ItemType,
    subcategory?: SubcategoryType
  ) => {
    const key = subcategory
      ? `${item}-${subcategory}`
      : item

    setEditingValues(prev => {
      const newState = { ...prev }

      delete newState[key]

      return newState
    })
  }

  const handleQuantityChange = (
    item: ItemType,
    value: string,
    subcategory?: SubcategoryType
  ) => {
    const numValue = parseInt(value)

    if (
      !isNaN(numValue) &&
      numValue >= 0
    ) {
      const currentQuantity =
        getCurrentQuantity(
          item,
          subcategory
        )

      const delta =
        numValue - currentQuantity

      if (delta !== 0) {
        onUpdateQuantity(
          item,
          delta,
          subcategory
        )
      }
    }

    clearEditingState(
      item,
      subcategory
    )
  }

  const getEditingValue = (
    item: ItemType,
    subcategory?: SubcategoryType
  ) => {
    const key = subcategory
      ? `${item}-${subcategory}`
      : item

    return editingValues[key]
  }

  const renderQuantityInput = (
    item: ItemType,
    quantity: number,
    subcategory?: SubcategoryType
  ) => {
    return (
      <QuantityInput
        value={
          getEditingValue(
            item,
            subcategory
          ) ?? quantity
        }
        onChange={e => {
          const value =
            e.target.value

          if (
            value === "" ||
            /^\d+$/.test(value)
          ) {
            const key =
              subcategory
                ? `${item}-${subcategory}`
                : item

            setEditingValues(prev => ({
              ...prev,
              [key]: value,
            }))
          }
        }}
        onBlur={e => {
          const value =
            e.target.value

          if (value !== "") {
            handleQuantityChange(
              item,
              value,
              subcategory
            )
          } else {
            clearEditingState(
              item,
              subcategory
            )
          }
        }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            const input =
              e.target as HTMLInputElement

            if (input.value !== "") {
              handleQuantityChange(
                item,
                input.value,
                subcategory
              )
            }

            input.blur()
          }
        }}
      />
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Resumo do Pedido
          </CardTitle>

          <Badge
            variant="secondary"
            className="text-sm"
          >
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}
          </Badge>
        </div>

        <CardDescription>
          Revise seu pedido antes de
          enviar
        </CardDescription>
      </CardHeader>

      <CardContent>
        {orders.items.map(
          (order, index) => (
            <div
              key={`${order.item}-${index}`}
              className="
                p-3 border rounded-lg
                bg-muted/30
                space-y-2
              "
            >
              <p className="font-medium text-sm">
                {order.item}
              </p>

              {!order.subcategory ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateQuantity(
                        order.item,
                        -1
                      )
                    }
                    type="button"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>

                  {renderQuantityInput(
                    order.item,
                    order.quantity ?? 0
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onUpdateQuantity(
                        order.item,
                        1
                      )
                    }
                    type="button"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      onRemoveItem(
                        order.item
                      )
                    }
                    type="button"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                order.subcategory.map(
                  sub => (
                    <div
                      key={sub.name}
                      className="
                        flex items-center
                        justify-between
                        gap-2
                        pl-3
                      "
                    >
                      <span className="text-xs">
                        {sub.name}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onUpdateQuantity(
                              order.item,
                              -1,
                              sub.name
                            )
                          }
                          type="button"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>

                        {renderQuantityInput(
                          order.item,
                          sub.quantity,
                          sub.name
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onUpdateQuantity(
                              order.item,
                              1,
                              sub.name
                            )
                          }
                          type="button"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            onRemoveItem(
                              order.item,
                              sub.name
                            )
                          }
                          type="button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )
        )}
      </CardContent>

      {orders.items.length > 0 && (
        <CardFooter>
          <SubmitOrderButton
            onClick={handleSubmit}
            loading={loading}
          />
        </CardFooter>
      )}
    </Card>
  )
}