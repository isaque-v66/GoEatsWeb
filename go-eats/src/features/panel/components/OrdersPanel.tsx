"use client"

import { useState } from "react"
import { format, parseISO, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, CalendarDays, CheckCircle2, Circle } from "lucide-react"
import { useAdminOrders, useReviewMutation, AdminOrderEntry, MEAL_LABELS } from "../hooks/useAdminOrders"
import { useTheme } from "@/src/shared/contexts/theme-context"

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR })
}

function OrderRow({ entry }: { entry: AdminOrderEntry }) {
  const reviewMutation = useReviewMutation()
  const isReviewed = !!entry.reviewedAt

  return (
    <TableRow className={isReviewed ? "opacity-60" : undefined}>
      <TableCell className="w-10">
        <Checkbox
          checked={isReviewed}
          disabled={reviewMutation.isPending}
          onCheckedChange={checked => {
            reviewMutation.mutate({
              id: entry.id,
              kind: entry.kind,
              reviewed: !!checked,
            })
          }}
        />
      </TableCell>

      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {isReviewed
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            : <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          }
          <span className="text-sm">{formatDate(entry.date)}</span>
        </div>
      </TableCell>

      <TableCell>
        <div>
          <p className="text-sm font-medium">{entry.companyName}</p>
          <p className="text-xs text-muted-foreground">{entry.cnpj}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={entry.kind === "scheduled" ? "outline" : "secondary"} className="text-xs">
            {entry.kind === "scheduled" ? "Especial" : "Normal"}
          </Badge>
          {entry.mealType && (
            <Badge variant="outline" className="text-xs font-normal">
              {MEAL_LABELS[entry.mealType] ?? entry.mealType}
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-0.5 max-w-xs">
          {entry.items.map((item, i) => (
            <p key={i} className="text-sm">
              {item.subcategoryName
                ? `${item.itemName} - ${item.subcategoryName}`
                : item.itemName
              }{" "}
              <span className="text-muted-foreground">×{item.quantity}</span>
            </p>
          ))}
        </div>
      </TableCell>

      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {entry.reviewedAt
          ? format(parseISO(entry.reviewedAt), "dd/MM HH:mm")
          : "—"
        }
      </TableCell>
    </TableRow>
  )
}

export function OrdersPanel() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const today = startOfToday()
  const [currentMonth, setCurrentMonth] = useState(today)
  const [selectedDay, setSelectedDay] = useState<string | undefined>(
    format(today, "yyyy-MM-dd")
  )

  const month = format(currentMonth, "yyyy-MM")
  const { data, isLoading, isFetching } = useAdminOrders(month, selectedDay)

  const daysWithOrders = new Set(data?.daysWithOrders ?? [])

  const allEntries: AdminOrderEntry[] = [
    ...(data?.orders ?? []),
    ...(data?.scheduledOrders ?? []),
  ].sort((a, b) => (a.date < b.date ? -1 : 1))

  const reviewedCount = allEntries.filter(e => !!e.reviewedAt).length
  const totalCount = allEntries.length

  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Calendário */}
        <Card className="p-3 shrink-0 self-start">
          <div className="flex items-center gap-2 px-1 pb-2 border-b mb-2">
            <CalendarDays className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Selecionar período</span>
          </div>

          <Calendar
            mode="single"
            locale={ptBR}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            selected={selectedDay ? parseISO(selectedDay) : undefined}
            onSelect={date => {
              setSelectedDay(date ? format(date, "yyyy-MM-dd") : undefined)
            }}
            modifiers={{
              hasOrders: (date) => daysWithOrders.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              hasOrders: "font-bold underline decoration-orange-500 decoration-2",
            }}
          />

          <div className="px-1 pt-2 border-t space-y-1">
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSelectedDay(undefined)}
            >
              Ver mês completo
            </button>
            <p className="text-xs text-muted-foreground">
              Dias com pedidos estão sublinhados em laranja
            </p>
          </div>
        </Card>

        {/* Tabela */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Cabeçalho da tabela */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold">
                {selectedDay
                  ? format(parseISO(selectedDay), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })
                }
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount === 0
                  ? "Nenhum pedido encontrado"
                  : `${totalCount} pedido(s) · ${reviewedCount} revisado(s)`
                }
              </p>
            </div>

            {isFetching && !isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Atualizando...
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Carregando pedidos...</span>
            </div>
          ) : allEntries.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground border rounded-lg">
              Nenhum pedido para este período
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="whitespace-nowrap">Revisado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.map(entry => (
                    <OrderRow key={`${entry.kind}-${entry.id}`} entry={entry} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
