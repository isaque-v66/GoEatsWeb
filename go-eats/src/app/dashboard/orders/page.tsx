"use client"

import { useState } from "react"
import { format, parseISO, isBefore, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Header } from "@/src/shared/components/header"
import { useUser } from "@/src/features/auth/contexts/user-context"
import { useOrderHistory } from "@/src/features/orders/hooks/useOrderHistory"
import { usePendingOrderChanges } from "@/src/features/orders/hooks/usePendingOrderChanges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarIcon,
  Minus,
  Plus,
  Lock,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Check,
  X as XIcon,
} from "lucide-react"
import toast from "react-hot-toast"
import type { HistoryEntry, HistoryScheduledOrder } from "@/src/features/orders/types/order-history.types"

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

function formatDate(dateKey: string) {
  return format(parseISO(dateKey), "dd/MM/yyyy", { locale: ptBR })
}

function formatLongDate(dateKey: string) {
  return format(parseISO(dateKey), "EEE, dd 'de' MMMM", { locale: ptBR })
}

// Mini-card de confirmação inline 
function PendingConfirmCard({
  description, busy, onConfirm, onCancel,
}: { description: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 border-t border-orange-200 dark:border-orange-900">
      <p className="text-xs text-orange-700 dark:text-orange-400 min-w-0 truncate">{description}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive"
          disabled={busy} onClick={onCancel} type="button">
          <XIcon className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="h-6 px-2 text-xs bg-orange-500 hover:bg-orange-600 text-white"
          disabled={busy} onClick={onConfirm} type="button">
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Confirmar</>}
        </Button>
      </div>
    </div>
  )
}

// Linha de pedido normal (só leitura) 
function NormalRow({ entry }: { entry: Extract<HistoryEntry, { kind: "normal" }> }) {
  return (
    <TableRow className="align-top">
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm capitalize">{formatLongDate(entry.date)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs font-normal">
          {MEAL_LABELS[entry.mealType] ?? entry.mealType}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          {entry.items.map(item => (
            <p key={item.id} className="text-sm">
              {item.subcategoryName ? `${item.itemName} - ${item.subcategoryName}` : item.itemName}
              <span className="text-muted-foreground ml-1">×{item.quantity}</span>
            </p>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Enviado</Badge>
      </TableCell>
    </TableRow>
  )
}

// Linha de pedido especial (editável)
function ScheduledRow({
  entry, occupiedDates, pending, busyKeys,
  onLocalQuantityChange, onLocalDateChange,
  onConfirmQuantity, onConfirmDate,
  onCancelQuantity, onCancelDate,
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
  const dateBusy = busyKeys.has(pending.dateKey(entry.id))




  const isDisabledDate = (date: Date) => {
    if (date < startOfToday()) return true
    const key = format(date, "yyyy-MM-dd")
    if (key === entry.date) return false
    return occupiedDates.includes(key)
  }

  return (
    <>
      <TableRow className="align-top">
        <TableCell className="whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="text-sm capitalize">
              {dateChange ? formatLongDate(dateChange.pendingDate) : formatLongDate(entry.date)}
            </span>
          </div>
          {/* Mover data */}
          {!isPast && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={dateBusy}
                  className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <CalendarIcon className="w-3 h-3" />
                  Mover data
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
          )}
        </TableCell>

        <TableCell>
          <Badge variant="outline" className="text-xs font-normal text-orange-600 border-orange-300">
            Especial
          </Badge>
        </TableCell>

        <TableCell>
          <div className="space-y-1.5">
            {entry.items.map(item => {
              const qtyChange = pending.getQuantityChange(item.id)
              const displayQty = qtyChange ? qtyChange.pendingQuantity : item.quantity
              const itemBusy = busyKeys.has(pending.quantityKey(item.id))

              return (
                <div key={item.id}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">
                      {item.subcategoryName ? `${item.itemName} - ${item.subcategoryName}` : item.itemName}
                    </span>
                    {isPast ? (
                      <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="outline" className="h-6 w-6"
                          disabled={itemBusy} onClick={() => onLocalQuantityChange(item.id, item.quantity, Math.max(0, displayQty - 1))} type="button">
                          <Minus className="w-2.5 h-2.5" />
                        </Button>
                        <Input
                          type="number" min={0} value={displayQty} disabled={itemBusy}
                          onChange={e => {
                            const v = parseInt(e.target.value, 10)
                            if (!isNaN(v) && v >= 0) onLocalQuantityChange(item.id, item.quantity, v)
                          }}
                          className="h-6 w-12 text-center text-xs px-1 tabular-nums"
                        />
                        <Button size="icon" variant="outline" className="h-6 w-6"
                          disabled={itemBusy} onClick={() => onLocalQuantityChange(item.id, item.quantity, displayQty + 1)} type="button">
                          <Plus className="w-2.5 h-2.5" />
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
        </TableCell>

        <TableCell>
          {isPast
            ? <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Passado</Badge>
            : <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-300">Agendado</Badge>
          }
        </TableCell>
      </TableRow>


      {dateChange && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <PendingConfirmCard
              description={`Mover para ${formatDate(dateChange.pendingDate)}`}
              busy={dateBusy}
              onConfirm={onConfirmDate}
              onCancel={onCancelDate}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}


export default function OrderHistoryPage() {
  const router = useRouter()
  const { user } = useUser()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const { entries, pagination, loading, updateScheduledItem, moveScheduledOrderDate } =
    useOrderHistory(user?.id, page, PAGE_SIZE)

  const pending = usePendingOrderChanges()
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set())

  const occupiedDates = entries
    .filter((e): e is HistoryScheduledOrder => e.kind === "scheduled")
    .map(e => e.date)

  const setBusy = (key: string, value: boolean) => {
    setBusyKeys(prev => {
      const next = new Set(prev)
      value ? next.add(key) : next.delete(key)
      return next
    })
  }

  const handleConfirmQuantity = async (scheduledOrderId: string, itemId: string) => {
    const change = pending.getQuantityChange(itemId)
    if (!change) return
    const key = pending.quantityKey(itemId)
    setBusy(key, true)
    const result = await updateScheduledItem(scheduledOrderId, itemId, change.pendingQuantity)
    setBusy(key, false)
    if (!result.success) toast.error(result.message ?? "Erro ao atualizar")
    else { pending.discardChange(key); toast.success("Quantidade atualizada") }
  }

  const handleConfirmDate = async (scheduledOrderId: string) => {
    const change = pending.getDateChange(scheduledOrderId)
    if (!change) return
    const key = pending.dateKey(scheduledOrderId)
    setBusy(key, true)
    const result = await moveScheduledOrderDate(scheduledOrderId, change.pendingDate)
    setBusy(key, false)
    if (!result.success) toast.error(result.message ?? "Erro ao mover data")
    else { pending.discardChange(key); toast.success("Pedido movido") }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="">
            <h1 className="text-xl font-semibold tracking-tight">Meus pedidos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pedidos enviados e agendados. Pedidos especiais futuros podem ser editados.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden p-4">
          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Carregando pedidos...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead className="whitespace-nowrap">Tipo</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(entry =>
                    entry.kind === "normal" ? (
                      <NormalRow key={entry.id} entry={entry} />
                    ) : (
                      <ScheduledRow
                        key={entry.id}
                        entry={entry as HistoryScheduledOrder}
                        occupiedDates={occupiedDates}
                        pending={pending}
                        busyKeys={busyKeys}
                        onLocalQuantityChange={(itemId, origQty, newQty) =>
                          pending.setPendingQuantity(entry.id, itemId, origQty, newQty)
                        }
                        onLocalDateChange={newDate => pending.setPendingDate(entry.id, entry.date, newDate)}
                        onConfirmQuantity={itemId => handleConfirmQuantity(entry.id, itemId)}
                        onConfirmDate={() => handleConfirmDate(entry.id)}
                        onCancelQuantity={itemId => pending.discardChange(pending.quantityKey(itemId))}
                        onCancelDate={() => pending.discardChange(pending.dateKey(entry.id))}
                      />
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}

     
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} pedido(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button variant="outline" size="sm"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
