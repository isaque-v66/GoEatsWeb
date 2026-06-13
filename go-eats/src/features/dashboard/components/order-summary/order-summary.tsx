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
import { Order, ScheduleType } from "../../types/order.types"
import { useUser } from "@/src/features/auth/contexts/user-context"
import { useSubmitOrder } from "../../hooks/useSubmitOrder"
import { QuantityInput } from "./quantity-input"
import { Button } from "@/components/ui/button"
import { OrderReviewDialog } from "./order-review-dialog"






interface OrderSummaryProps {
  orders: Order

  onUpdateQuantity: (
    orderId: string,
    delta: number,
    subId?: string
  ) => void

  onRemoveItem: (
    orderId: string,
    subId?: string
  ) => void

  onUpdateScheduleType: (
    orderId: string,
    scheduleType: ScheduleType
  ) => void

  onUpdateDefaultFlag: (
    orderId: string,
    value: boolean
  ) => void

  onUpdateSubScheduleType: (
    orderId: string,
    subId: string,
    scheduleType: ScheduleType
  ) => void

  onUpdateSubDefaultFlag: (
    orderId: string,
    subId: string,
    value: boolean
  ) => void


  onUpdateDateRange: (
    orderId: string, 
    startDate?: string, 
    endDate?: string, 
    subId?: string
  ) => void 
  
}









export function OrderSummary({orders, onUpdateQuantity, onRemoveItem, 
  onUpdateScheduleType, onUpdateDefaultFlag, onUpdateSubScheduleType,
  onUpdateSubDefaultFlag, onUpdateDateRange }: OrderSummaryProps) {



  const { user } = useUser()

  const { submitOrder, loading } = useSubmitOrder()

  const [editingValues, setEditingValues] = useState<Record<string, string>>({})

  const [reviewOpen, setReviewOpen] = useState(false)



  const totalItems = orders.items.reduce(
    (sum, order) => {
      if (order.subcategories?.length) {
        return (
          sum +
          order.subcategories.reduce(
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
  if (!user?.id || !user?.companyId) {
    alert("Usuário não autenticado")
    return
  }




  const result = await submitOrder({
    userId: user.id,
    companyId: user.companyId,
    orders,
  })

  alert(result.message)
}



  const getCurrentQuantity = (orderId: string, subId?: string): number => {
    const orderItem = orders.items.find(
      o => o.id === orderId
    )

    if (!orderItem) return 0

    if (
      subId &&
      orderItem.subcategories
    ) {
      const sub =
        orderItem.subcategories.find(
          s => s.id === subId
        )

      return sub?.quantity ?? 0
    }

    return orderItem.quantity ?? 0
  }





  const clearEditingState = (orderId: string, subId?: string) => {
    const key = subId
      ? `${orderId}-${subId}`
      : orderId

    setEditingValues(prev => {
      const newState = { ...prev }

      delete newState[key]

      return newState
    })
  }




  const handleQuantityChange = (orderId: string, value: string, subId?: string) => {
    const numValue = parseInt(value)

    if (
      !isNaN(numValue) &&
      numValue >= 0
    ) {
      const currentQuantity =
        getCurrentQuantity(
          orderId,
          subId
        )

      const delta =
        numValue - currentQuantity

      if (delta !== 0) {
        onUpdateQuantity(
          orderId,
          delta,
          subId
        )
      }
    }

    clearEditingState(
      orderId,
      subId
    )
  }






  const getEditingValue = (orderId: string, subId?: string) => {
    const key = subId
      ? `${orderId}-${subId}`
      : orderId

    return editingValues[key]
  }




  const renderQuantityInput = ( orderId: string, quantity: number, subId?: string) => {
    return (
      <QuantityInput
        value={
          getEditingValue(
            orderId,
            subId
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
              subId
                ? `${orderId}-${subId}`
                : orderId

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
              orderId,
              value,
              subId
            )
          } else {
            clearEditingState(
              orderId,
              subId
            )
          }
        }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            const input =
              e.target as HTMLInputElement

            if (input.value !== "") {
              handleQuantityChange(
                orderId,
                input.value,
                subId
              )
            }

            input.blur()
          }
        }}
      />
    )
  }






  function getScheduleLabel(order: Order["items"][number]) {
  if (order.specificDate) {
    return new Date(order.specificDate)
      .toLocaleDateString("pt-BR")
  }

  switch (order.scheduleType) {
    case "WEEKDAY":
      return "Segunda à Sexta"

    case "SATURDAY":
      return "Sábado"

    case "SUNDAY":
      return "Domingo"

    default:
      return "-"
  }
}















  return (
    <Card className="shadow-sm border">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            Resumo do Pedido
          </CardTitle>

          <Badge variant="secondary" className="text-xs font-medium tabular-nums">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </Badge>
        </div>

        <CardDescription className="text-xs mt-1">
          Revise seu pedido antes de enviar
        </CardDescription>
      </CardHeader>

      {/* Items */}
      <CardContent className="px-4 py-3 space-y-2">
        {orders.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum item adicionado
          </p>
        ) : (
          orders.items.map(order => (
            <div
              key={order.id}
              className="rounded-lg border bg-muted/30 overflow-hidden"
            >
              {!order.subcategories?.length ? (
                /* Item simples */
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {order.item}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {getScheduleLabel(order)}
                        </span>
                        {order.updateDefault && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 font-normal"
                          >
                            Padrão
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 shrink-0"
                      onClick={() => onUpdateQuantity(order.id, -1)}
                      type="button"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    {renderQuantityInput(order.id, order.quantity ?? 0)}

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 shrink-0"
                      onClick={() => onUpdateQuantity(order.id, 1)}
                      type="button"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>

                    <div className="flex-1" />

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      onClick={() => onRemoveItem(order.id)}
                      type="button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Item com subcategorias */
                <div>
                  <div className="px-3 pt-3 pb-2">
                    <p className="font-medium text-sm">{order.item}</p>
                  </div>

                  <div className="divide-y border-t">
                    {order.subcategories.map(sub => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-background"
                      >
                        <span className="text-sm text-muted-foreground truncate min-w-0">
                          {sub.name}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(order.id, -1, sub.id)}
                            type="button"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          {renderQuantityInput(order.id, sub.quantity, sub.id)}

                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => onUpdateQuantity(order.id, 1, sub.id)}
                            type="button"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => onRemoveItem(order.id, sub.id)}
                            type="button"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>

      {/* Footer */}
      {orders.items.length > 0 && (
        <CardFooter className="px-4 py-3 border-t bg-muted/20">
          <Button
            className="w-full"
            size="sm"
            onClick={() => setReviewOpen(true)}
          >
            Revisar Pedido
          </Button>
        </CardFooter>
      )}

      <OrderReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        orders={orders}
        onSubmit={handleSubmit}
        onUpdateScheduleType={onUpdateScheduleType}
        onUpdateDefaultFlag={onUpdateDefaultFlag}
        onUpdateSubScheduleType={onUpdateSubScheduleType}
        onUpdateSubDefaultFlag={onUpdateSubDefaultFlag}
        onUpdateDateRange={onUpdateDateRange}
      />
    </Card>
  )

}



