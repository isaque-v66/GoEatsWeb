"use client"

import { useMemo, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar as CalendarIcon,
  History,
  Minus,
  Plus,
  CalendarClock,
  Lock,
  Loader2,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO, isBefore, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useUser } from "@/src/features/auth/contexts/user-context"
import { useOrderHistory } from "../hooks/useOrderHistory"
import { useOrderHistory as useOrderHistoryUi } from "../context/ordersHistory.context"
import type { HistoryEntry, HistoryScheduledOrder } from "../types/order-history.types"
import toast from "react-hot-toast"

const MEAL_LABELS: Record<string, string> = {
  DESJEJUM: "Desjejum",
  ALMOCO: "Almoço",
  CAFE_TARDE: "Café da tarde",
  JANTAR: "Jantar",
  CEIA: "Ceia",
  LANCHE: "Lanche",
  BEBIDAS: "Bebidas",
  CAFE_NOTURNO: "Café noturno",
}

function formatLongDate(dateKey: string) {
  return format(parseISO(dateKey), "EEEE, dd 'de' MMMM", { locale: ptBR })
}

function ScheduledOrderCard({
  entry,
  occupiedDates,
  onUpdateQuantity,
  onMoveDate,
  busy,
}: {
  entry: HistoryScheduledOrder
  occupiedDates: string[]
  onUpdateQuantity: (scheduledOrderItemId: string, quantity: number) => void
  onMoveDate: (newDate: string) => void
  busy: boolean
}) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isPast = isBefore(parseISO(entry.date), startOfToday())

  const isDisabledDate = (date: Date) => {
    if (date < startOfToday()) return true
    const key = format(date, "yyyy-MM-dd")
    if (key === entry.date) return false // permite manter a própria data
    return occupiedDates.includes(key)
  }

  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarClock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-sm font-medium capitalize truncate">
            {formatLongDate(entry.date)}
          </span>
        </div>

        {entry.applyAsDefault && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
            Padrão
          </Badge>
        )}
      </div>

      <div className="divide-y border-t bg-background">
        {entry.items.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm truncate">{item.itemName}</p>
              {item.subcategoryName && (
                <p className="text-xs text-muted-foreground truncate">{item.subcategoryName}</p>
              )}
            </div>

            {isPast ? (
              <span className="text-sm text-muted-foreground shrink-0">{item.quantity}</span>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  disabled={busy}
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  type="button"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  disabled={busy}
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  type="button"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isPast && (
        <div className="px-3 py-2 border-t bg-muted/20">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={busy}
                className="w-full flex items-center gap-2 h-8 px-2.5 rounded-md border text-xs text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Mover para outro dia
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={parseISO(entry.date)}
                disabled={isDisabledDate}
                onSelect={date => {
                  if (!date) return
                  onMoveDate(format(date, "yyyy-MM-dd"))
                  setCalendarOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

function NormalOrderCard({ entry }: { entry: Extract<HistoryEntry, { kind: "normal" }> }) {
  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden opacity-90">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium capitalize truncate">
            {formatLongDate(entry.date)}
          </span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
          {MEAL_LABELS[entry.mealType] ?? entry.mealType}
        </Badge>
      </div>

      <div className="divide-y border-t bg-background">
        {entry.items.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm truncate">{item.itemName}</p>
              {item.subcategoryName && (
                <p className="text-xs text-muted-foreground truncate">{item.subcategoryName}</p>
              )}
            </div>
            <span className="text-sm text-muted-foreground shrink-0">{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderHistorySheet() {
  const ui = useOrderHistoryUi()
  const { user } = useUser()
  const { entries, loading, updateScheduledItem, moveScheduledOrderDate } = useOrderHistory(
    user?.id,
    ui?.open ?? false
  )
  const [busyId, setBusyId] = useState<string | null>(null)

  // Datas já ocupadas por outros ScheduledOrders (exclui o próprio, calculado por item)
  const occupiedByEntry = useMemo(() => {
    const scheduledDates = entries
      .filter((e): e is HistoryScheduledOrder => e.kind === "scheduled")
      .map(e => e.date)
    return scheduledDates
  }, [entries])

  if (!ui) return null

  const handleQuantityChange = async (
    scheduledOrderId: string,
    scheduledOrderItemId: string,
    quantity: number
  ) => {
    setBusyId(scheduledOrderId)
    const result = await updateScheduledItem(scheduledOrderId, scheduledOrderItemId, quantity)
    if (!result.success) toast.error(result.message ?? "Erro ao atualizar quantidade")
    setBusyId(null)
  }

  const handleMoveDate = async (scheduledOrderId: string, newDate: string) => {
    setBusyId(scheduledOrderId)
    const result = await moveScheduledOrderDate(scheduledOrderId, newDate)
    if (!result.success) toast.error(result.message ?? "Erro ao mover data")
    else toast.success("Pedido movido com sucesso")
    setBusyId(null)
  }

  return (
    <Sheet open={ui.open} onOpenChange={open => (open ? ui.openHistory() : ui.closeHistory())}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <History className="w-4 h-4 text-muted-foreground" />
            Seus pedidos
          </SheetTitle>
          <SheetDescription className="text-xs">
            Pedidos do dia ficam só para consulta. Pedidos especiais podem ter
            quantidade e data alteradas.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Carregando pedidos...</span>
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Nenhum pedido encontrado
            </p>
          ) : (
            entries.map(entry =>
              entry.kind === "normal" ? (
                <NormalOrderCard key={`normal-${entry.id}`} entry={entry} />
              ) : (
                <ScheduledOrderCard
                  key={`scheduled-${entry.id}`}
                  entry={entry}
                  occupiedDates={occupiedByEntry}
                  busy={busyId === entry.id}
                  onUpdateQuantity={(itemId, qty) => handleQuantityChange(entry.id, itemId, qty)}
                  onMoveDate={date => handleMoveDate(entry.id, date)}
                />
              )
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
