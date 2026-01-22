"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { ItemType, Order, SubcategoryType } from "./dashboard-content"





interface OrderSummaryProps {
  orders: Order
  onUpdateQuantity: (
    item: ItemType,
    delta: number,
    subcategory?: SubcategoryType
  ) => void
}






export function OrderSummary({ orders, onUpdateQuantity }: OrderSummaryProps) {
  const totalItems = orders.items.reduce((sum, order) => {
  if (order.subcategories?.length) {
    return (
      sum +
      order.subcategories.reduce(
        (subSum, sub) => subSum + (sub.quantity ?? 0),
        0
      )
    )
  }

  return sum + (order.quantity ?? 0)
}, 0)









  const handleSubmit = () => {
    alert("Order submitted successfully!")
    console.log("Orders:", orders)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Resumo do Pedido
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </Badge>
        </div>
        <CardDescription>Revise seu pedido antes de enviar</CardDescription>
      </CardHeader>
      <CardContent>
      {orders.items.map((order, index) => (
  <div key={order.item} className="p-3 border rounded-lg bg-muted/30 space-y-2">

    <p className="font-medium text-sm">{order.item}</p>


    

    {/* ITEM SEM SUBCATEGORIA */}
    {!order.subcategories && (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(order.item, -1)}
        >
          <Minus className="w-3 h-3" />
        </Button>

        <span className="w-8 text-center">{order.quantity}</span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(order.item, +1)}
        >
          <Plus className="w-3 h-3" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={() => onUpdateQuantity(order.item, -999)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    )}

    {/* ITEM COM SUBCATEGORIAS */}
    {order.subcategories?.map(sub => (
      <div
        key={sub.name}
        className="flex items-center justify-between gap-2 pl-3"
      >
        <span className="text-xs">{sub.name}</span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onUpdateQuantity(order.item, -1, sub.name)
            }
          >
            <Minus className="w-3 h-3" />
          </Button>

          <span className="w-6 text-center text-sm">
            {sub.quantity}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onUpdateQuantity(order.item, +1, sub.name)
            }
          >
            <Plus className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() =>
              onUpdateQuantity(order.item, -999, sub.name)
            }
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    ))}
  </div>
))}

      </CardContent>
      {orders.items.length > 0 && (
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Enviar Pedido
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
