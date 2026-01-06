"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"

interface OrderItem {
  category: string
  subcategory?: string
  quantity: number
  customText?: string
}

interface OrderSummaryProps {
  orders: OrderItem[]
  onUpdateQuantity: (index: number, delta: number) => void
}

export function OrderSummary({ orders, onUpdateQuantity }: OrderSummaryProps) {
  const totalItems = orders.reduce((sum, order) => sum + order.quantity, 0)

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
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum item no seu pedido ainda</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {orders.map((order, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-relaxed">{order.category}</p>
                      {order.subcategory && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {order.subcategory}
                        </Badge>
                      )}
                      {order.customText && (
                        <p className="text-xs text-muted-foreground mt-1 italic">"{order.customText}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 bg-transparent"
                        onClick={() => onUpdateQuantity(index, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{order.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 bg-transparent"
                        onClick={() => onUpdateQuantity(index, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => onUpdateQuantity(index, -order.quantity)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {orders.length > 0 && (
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Enviar Pedido
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
