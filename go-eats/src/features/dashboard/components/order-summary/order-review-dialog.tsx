"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X, AlertTriangle } from "lucide-react"
import { format, eachDayOfInterval, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo, useState } from "react"
import { DateRange } from "react-day-picker"
import { Order, ScheduleType } from "../../types/order.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order
  onSubmit: () => void
  onUpdateScheduleType: (orderId: string, scheduleType: ScheduleType) => void
  onUpdateDefaultFlag: (orderId: string, value: boolean) => void
  onUpdateSubScheduleType: (orderId: string, subId: string, scheduleType: ScheduleType) => void
  onUpdateSubDefaultFlag: (orderId: string, subId: string, value: boolean) => void
  onUpdateDateRange: (orderId: string, startDate?: string, endDate?: string, subId?: string) => void
  submitting: boolean
}




function formatDateRange(startDate?: string, endDate?: string) {
  if (!startDate) return null
  const start = format(parseISO(startDate), "dd MMM", { locale: ptBR })
  if (!endDate || endDate === startDate) return start
  const end = format(parseISO(endDate), "dd MMM", { locale: ptBR })
  return `${start} → ${end}`
}





function countDays(startDate?: string, endDate?: string) {
  if (!startDate) return 0
  if (!endDate || endDate === startDate) return 1
  return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).length
}

// Detecta conflitos: mesmo item (+sub) em datas que se sobrepõem
type ConflictEntry = { key: string; date: string }



function getAllDatesForEntry(startDate?: string, endDate?: string): string[] {
  if (!startDate) return []
  if (!endDate || endDate === startDate) return [startDate]
  return eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map(d => format(d, "yyyy-MM-dd"))
}





function findConflicts(orders: Order): Set<string> {
  
  const seen = new Map<string, Set<string>>() // key -> set de datas já usadas
  const conflictingOrderIds = new Set<string>()

  for (const order of orders.items) {
    if (!order.subcategories?.length) {
      const key = order.item
      const dates = getAllDatesForEntry(order.startDate, order.endDate)

      if (!seen.has(key)) seen.set(key, new Set())
      const usedDates = seen.get(key)!

      for (const date of dates) {
        if (usedDates.has(date)) {
          conflictingOrderIds.add(order.id)
        }
        usedDates.add(date)
      }
    } else {
      for (const sub of order.subcategories) {
        const key = `${order.item}::${sub.name}`
        const dates = getAllDatesForEntry(sub.startDate, sub.endDate)

        if (!seen.has(key)) seen.set(key, new Set())
        const usedDates = seen.get(key)!

        for (const date of dates) {
          if (usedDates.has(date)) {
            conflictingOrderIds.add(sub.id)
          }
          usedDates.add(date)
        }
      }
    }
  }

  return conflictingOrderIds
}

function DateRangePicker({startDate, endDate, onChange, onClear, hasConflict}: {
  startDate?: string
  endDate?: string
  onChange: (start?: string, end?: string) => void
  onClear: () => void
  hasConflict?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"single" | "range">("single")

  const selected: DateRange | undefined = startDate
    ? { from: parseISO(startDate), to: endDate ? parseISO(endDate) : undefined }
    : undefined

  const label = formatDateRange(startDate, endDate)
  const days = countDays(startDate, endDate)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Defina a data do pedido
        </Label>
        {startDate && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {(["single", "range"] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              mode === m
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {m === "single" ? "Dia único" : "Intervalo"}
          </button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`w-full flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors text-left ${
              hasConflict
                ? "border-destructive bg-destructive/5 text-destructive"
                : "border-border bg-background hover:border-foreground"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            {label ? (
              <span className="flex items-center gap-2">
                {label}
                {days > 1 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {days} dias
                  </Badge>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Selecionar data</span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {mode === "single" ? (
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selected?.from}
              disabled={{ before: new Date() }}
              onSelect={date => {
                if (!date) return
                const iso = format(date, "yyyy-MM-dd")
                onChange(iso, iso)
                setOpen(false)
              }}
            />
          ) : (
            <div>
              <Calendar
                mode="range"
                locale={ptBR}
                selected={selected}
                disabled={{ before: new Date() }}
                numberOfMonths={2}
                onSelect={range => {
                  if (!range?.from) return
                  const start = format(range.from, "yyyy-MM-dd")
                  const end = range.to ? format(range.to, "yyyy-MM-dd") : start
                  onChange(start, end)
                  if (range.to) setOpen(false)
                }}
              />
              {!selected?.to && (
                <p className="text-xs text-muted-foreground text-center pb-3">
                  Selecione a data de término
                </p>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {hasConflict && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Já existe um pedido deste item nesta data
        </p>
      )}

      {days > 1 && !hasConflict && (
        <p className="text-xs text-muted-foreground">
          Serão criados {days} pedidos — um por dia no intervalo
        </p>
      )}
    </div>
  )
}

export function OrderReviewDialog({
  open,
  onOpenChange,
  orders,
  onSubmit,
  onUpdateDefaultFlag,
  onUpdateSubDefaultFlag,
  onUpdateDateRange,
  submitting,
}: Props) {
  const conflicts = useMemo(() => findConflicts(orders), [orders])
  const hasAnyConflict = conflicts.size > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Revisar Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-4 space-y-3">
          {orders.items.map(order => (
            <div key={order.id} className="rounded-lg border bg-muted/30 p-4 space-y-4">
              {!order.subcategories?.length ? (
                <>
                  <div>
                    <h3 className="font-semibold text-sm">{order.item}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quantidade: {order.quantity}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <DateRangePicker
                      startDate={order.startDate}
                      endDate={order.endDate}
                      hasConflict={conflicts.has(order.id)}
                      onChange={(start, end) => onUpdateDateRange(order.id, start, end)}
                      onClear={() => onUpdateDateRange(order.id, undefined, undefined)}
                    />

                    {order.startDate && (
                      <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                        <Checkbox
                          checked={order.updateDefault ?? false}
                          onCheckedChange={checked => onUpdateDefaultFlag(order.id, !!checked)}
                          className="rounded"
                        />
                        <div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Tornar novo padrão
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Atualiza a quantidade padrão para os dias correspondentes
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-sm">{order.item}</h3>

                  <div className="space-y-2">
                    {order.subcategories.map(sub => (
                      <div key={sub.id} className="rounded-md border bg-background p-3 space-y-3">
                        <div>
                          <p className="font-medium text-sm">{sub.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Quantidade: {sub.quantity}
                          </p>
                        </div>

                        <DateRangePicker
                          startDate={sub.startDate}
                          endDate={sub.endDate}
                          hasConflict={conflicts.has(sub.id)}
                          onChange={(start, end) => onUpdateDateRange(order.id, start, end, sub.id)}
                          onClear={() => onUpdateDateRange(order.id, undefined, undefined, sub.id)}
                        />

                        {sub.startDate && (
                          <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                            <Checkbox
                              checked={sub.updateDefault ?? false}
                              onCheckedChange={checked => onUpdateSubDefaultFlag(order.id, sub.id, !!checked)}
                              className="rounded"
                            />
                            <div>
                              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                Tornar novo padrão
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Atualiza a quantidade padrão para os dias correspondentes
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20 gap-2 flex-col sm:flex-row items-stretch sm:items-center">
          {hasAnyConflict && (
            <p className="text-xs text-destructive flex items-center gap-1.5 mr-auto">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Resolva as datas conflitantes antes de confirmar
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={onSubmit} disabled={submitting || hasAnyConflict}>
              {submitting ? "Enviando..." : "Confirmar Pedido"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}