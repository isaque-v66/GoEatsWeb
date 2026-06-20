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
import { Input } from "@/components/ui/input"
import {
  Calendar as CalendarIcon,
  History,
  Minus,
  Plus,
  CalendarClock,
  Lock,
  Loader2,
  Check,
  X as XIcon,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parseISO, isBefore, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useUser } from "@/src/features/auth/contexts/user-context"
import { useOrderHistory } from "../hooks/useOrderHistory"
import { useOrderHistory as useOrderHistoryUi } from "../context/ordersHistory.context"
import { usePendingOrderChanges } from "../hooks/usePendingOrderChanges"
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

function formatShortDate(dateKey: string) {
  return format(parseISO(dateKey), "dd/MM/yyyy")
}

// ── Mini-card de confirmação: aparece logo abaixo do item/pedido que tem
// uma mudança pendente, com "Confirmar" (dispara API) e "Cancelar" (descarta).
function PendingConfirmCard({
  description,
  busy,
  onConfirm,
  onCancel,
}: {
  description: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-950/30 border-t border-orange-200 dark:border-orange-900">
      <p className="text-xs text-orange-700 dark:text-orange-400 min-w-0 truncate">
        {description}
      </p>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          <XIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
          disabled={busy}
          onClick={onConfirm}
          type="button"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
          {busy ? "" : "Confirmar"}
        </Button>
      </div>
    </div>
  )
}

function ScheduledOrderCard({
  entry,
  occupiedDates,
  pending,
  busyKeys,
  onLocalQuantityChange,
  onLocalDateChange,
  onConfirmQuantity,
  onConfirmDate,
  onCancelQuantity,
  onCancelDate,
}: {
  entry: HistoryScheduledOrder
  occupiedDates: string[]
  pending: ReturnType<typeof usePendingOrderChanges>
  busyKeys: Set<string>
  onLocalQuantityChange: (itemId: string, originalQty: number, newQty: number) => void
  onLocalDateChange: (newDate: string) => void
  onConfirmQuantity: (itemId: string) => void
  onConfirmDate: () => void
  onCancelQuantity: (itemId: string) => void
  onCancelDate: () => void
}) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const isPast = isBefore(parseISO(entry.date), startOfToday())
  const dateChange = pending.getDateChange(entry.id)

  const isDisabledDate = (date: Date) => {
    if (date < startOfToday()) return true
    const key = format(date, "yyyy-MM-dd")
    if (key === entry.date) return false
    return occupiedDates.includes(key)
  }

  return (
    <div className="rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarClock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-sm font-medium capitalize truncate">
            {dateChange ? formatLongDate(dateChange.pendingDate) : formatLongDate(entry.date)}
          </span>
        </div>

        {entry.applyAsDefault && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0">
            Padrão
          </Badge>
        )}
      </div>

      <div className="divide-y border-t bg-background">
        {entry.items.map(item => {
          const qtyChange = pending.getQuantityChange(item.id)
          const displayQuantity = qtyChange ? qtyChange.pendingQuantity : item.quantity
          const itemBusy = busyKeys.has(pending.quantityKey(item.id))

          return (
            <div key={item.id}>
              <div className="flex items-center justify-between gap-2 px-3 py-2">
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
                      disabled={itemBusy}
                      onClick={() => onLocalQuantityChange(item.id, item.quantity, Math.max(0, displayQuantity - 1))}
                      type="button"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>

                    <Input
                      type="number"
                      min={0}
                      value={displayQuantity}
                      disabled={itemBusy}
                      onChange={e => {
                        const val = e.target.value
                        if (val === "") return
                        const numVal = parseInt(val, 10)
                        if (!isNaN(numVal) && numVal >= 0) {
                          onLocalQuantityChange(item.id, item.quantity, numVal)
                        }
                      }}
                      className="h-7 w-14 text-center text-sm px-1 tabular-nums"
                    />

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      disabled={itemBusy}
                      onClick={() => onLocalQuantityChange(item.id, item.quantity, displayQuantity + 1)}
                      type="button"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {qtyChange && (
                <PendingConfirmCard
                  description={`Alterar para ${qtyChange.pendingQuantity}`}
                  busy={itemBusy}
                  onConfirm={() => onConfirmQuantity(item.id)}
                  onCancel={() => onCancelQuantity(item.id)}
                />
              )}
            </div>
          )
        })}
      </div>

      {!isPast && (
        <div className="px-3 py-2 border-t bg-muted/20">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={busyKeys.has(pending.dateKey(entry.id))}
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
                selected={parseISO(dateChange?.pendingDate ?? entry.date)}
                disabled={isDisabledDate}
                onSelect={date => {
                  if (!date) return
                  onLocalDateChange(format(date, "yyyy-MM-dd"))
                  setCalendarOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {dateChange && (
        <PendingConfirmCard
          description={`Mover pedido para ${formatShortDate(dateChange.pendingDate)}`}
          busy={busyKeys.has(pending.dateKey(entry.id))}
          onConfirm={onConfirmDate}
          onCancel={onCancelDate}
        />
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
  const pending = usePendingOrderChanges()
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set())

  const occupiedByEntry = useMemo(() => {
    return entries
      .filter((e): e is HistoryScheduledOrder => e.kind === "scheduled")
      .map(e => e.date)
  }, [entries])

  if (!ui) return null

  const setBusy = (key: string, value: boolean) => {
    setBusyKeys(prev => {
      const next = new Set(prev)
      if (value) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const handleConfirmQuantity = async (scheduledOrderId: string, scheduledOrderItemId: string) => {
    const change = pending.getQuantityChange(scheduledOrderItemId)
    if (!change) return

    const key = pending.quantityKey(scheduledOrderItemId)
    setBusy(key, true)
    const result = await updateScheduledItem(scheduledOrderId, scheduledOrderItemId, change.pendingQuantity)
    setBusy(key, false)

    if (!result.success) {
      toast.error(result.message ?? "Erro ao atualizar quantidade")
      return
    }
    pending.discardChange(key)
    toast.success("Quantidade atualizada")
  }

  const handleConfirmDate = async (scheduledOrderId: string) => {
    const change = pending.getDateChange(scheduledOrderId)
    if (!change) return

    const key = pending.dateKey(scheduledOrderId)
    setBusy(key, true)
    const result = await moveScheduledOrderDate(scheduledOrderId, change.pendingDate)
    setBusy(key, false)

    if (!result.success) {
      toast.error(result.message ?? "Erro ao mover data")
      return
    }
    pending.discardChange(key)
    toast.success("Pedido movido com sucesso")
  }

  return (
    <Sheet
      open={ui.open}
      onOpenChange={open => {
        // Fechar o sheet descarta qualquer alteração pendente não confirmada
        if (!open) {
          for (const entry of entries) {
            if (entry.kind === "scheduled") pending.discardAllForOrder(entry.id)
          }
        }
        open ? ui.openHistory() : ui.closeHistory()
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <History className="w-4 h-4 text-muted-foreground" />
            Seus pedidos
          </SheetTitle>
          <SheetDescription className="text-xs">
            Pedidos do dia ficam só para consulta. Ajuste quantidade ou data
            dos pedidos especiais e confirme para salvar.
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
                  pending={pending}
                  busyKeys={busyKeys}
                  onLocalQuantityChange={(itemId, originalQty, newQty) =>
                    pending.setPendingQuantity(entry.id, itemId, originalQty, newQty)
                  }
                  onLocalDateChange={newDate => pending.setPendingDate(entry.id, entry.date, newDate)}
                  onConfirmQuantity={itemId => handleConfirmQuantity(entry.id, itemId)}
                  onConfirmDate={() => handleConfirmDate(entry.id)}
                  onCancelQuantity={itemId => pending.discardChange(pending.quantityKey(itemId))}
                  onCancelDate={() => pending.discardChange(pending.dateKey(entry.id))}
                />
              )
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
