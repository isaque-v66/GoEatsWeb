"use client"

import { useState } from "react"
import { format, parseISO, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Loader2, CalendarDays, CheckCircle2, Circle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import {
  useAdminOrders, useReviewMutation, UserDayRow, MEAL_LABELS,
} from "../hooks/useAdminOrders"

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR })
}

function MealBadges({ meals }: { meals: UserDayRow["meals"] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {meals.map((meal, mi) => (
        <div key={mi} className="flex flex-wrap gap-1">
          {meal.items.map((item, ii) => (
            <Badge
              key={`${mi}-${ii}`}
              variant="outline"
              className="text-xs font-normal whitespace-nowrap"
            >
              <span className="text-muted-foreground mr-1">
                {meal.mealType !== "ESPECIAL" ? MEAL_LABELS[meal.mealType] ?? meal.mealType : "Especial"}
                {item.subcategoryName ? ` · ${item.subcategoryName}` : ""}:
              </span>
              <span className="font-medium">{item.quantity}</span>
            </Badge>
          ))}
        </div>
      ))}
    </div>
  )
}

function OrderRow({ row }: { row: UserDayRow }) {
  const reviewMutation = useReviewMutation()
  const isReviewed = !!row.reviewedAt
  const hasRealOrders = row.sources.length > 0

  return (
    <TableRow className={isReviewed ? "opacity-55" : undefined}>
      {/* Checkbox único para a linha inteira */}
      <TableCell className="w-10">
        {!hasRealOrders ? (
          <Clock className="w-4 h-4 text-muted-foreground/50 mx-auto" />
        ) : (
          <Checkbox
            checked={isReviewed}
            disabled={reviewMutation.isPending}
            onCheckedChange={checked => {
              reviewMutation.mutate({ sources: row.sources, reviewed: !!checked })
            }}
          />
        )}
      </TableCell>

      {/* Data + status */}
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {!hasRealOrders ? (
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : isReviewed ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm">{formatDate(row.date)}</span>
        </div>
      </TableCell>

      {/* Empresa */}
      <TableCell>
        <div>
          <p className="text-sm font-medium">{row.companyName}</p>
          <p className="text-xs text-muted-foreground">{row.cnpj}</p>
        </div>
      </TableCell>

      {/* Serviços para atendimento — colunas dinâmicas via badges */}
      <TableCell className="max-w-md">
        <MealBadges meals={row.meals} />
        {/* {row.hasProjection && (
          <p className="text-[11px] text-muted-foreground mt-1">
            
          </p>
        )} */}
      </TableCell>

      {/* Revisado em */}
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {row.reviewedAt
          ? format(parseISO(row.reviewedAt), "dd/MM HH:mm")
          : !hasRealOrders ? "Aguardando envio" : "—"
        }
      </TableCell>
    </TableRow>
  )
}

export function OrdersPanel() {
  const today = startOfToday()
  const [currentMonth, setCurrentMonth] = useState(today)
  const [selectedDay, setSelectedDay] = useState<string | undefined>(
    format(today, "yyyy-MM-dd")
  )
  const [page, setPage] = useState(1)

  const month = format(currentMonth, "yyyy-MM")
  const { data, isLoading, isFetching } = useAdminOrders(month, selectedDay, page)

  const daysWithOrders = new Set(data?.daysWithOrders ?? [])
  const rows = data?.rows ?? []
  const pagination = data?.pagination

  const reviewableRows = rows.filter(r => r.sources.length > 0)
  const reviewedCount = reviewableRows.filter(r => !!r.reviewedAt).length
  const totalReviewable = reviewableRows.length
  const projectedCount = rows.filter(r => r.hasProjection).length

  function handleSelectDay(date?: string) {
    setSelectedDay(date)
    setPage(1)
  }

  function handleMonthChange(date: Date) {
    setCurrentMonth(date)
    setPage(1)
  }

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
            onMonthChange={handleMonthChange}
            selected={selectedDay ? parseISO(selectedDay) : undefined}
            onSelect={date => {
              handleSelectDay(date ? format(date, "yyyy-MM-dd") : undefined)
            }}
            modifiers={{
              hasOrders: date => daysWithOrders.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              hasOrders: "font-bold underline decoration-orange-500 decoration-2",
            }}
          />

          <div className="px-1 pt-2 border-t space-y-1.5">
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => handleSelectDay(undefined)}
            >
              Ver mês completo
            </button>
            <p className="text-xs text-muted-foreground">
              Dias sublinhados têm pedidos
            </p>
          </div>
        </Card>

        {/* Tabela */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-base font-semibold capitalize">
                {selectedDay
                  ? format(parseISO(selectedDay), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })
                }
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rows.length === 0
                  ? "Nenhum pedido encontrado"
                  : [
                      totalReviewable > 0 && `${reviewedCount}/${totalReviewable} revisado(s)`,
                      projectedCount > 0 && `${projectedCount} com projeção`,
                      pagination && `${pagination.total} no total`,
                    ].filter(Boolean).join(" · ")
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
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground border rounded-lg">
              Nenhum pedido para este período
            </div>
          ) : (
            <>
              {/* Legenda */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Revisado
                </span>
                <span className="flex items-center gap-1">
                  <Circle className="w-3.5 h-3.5" /> Pendente
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Agendado (somente projeção)
                </span>
              </div>

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="whitespace-nowrap">Data</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Serviços para atendimento</TableHead>
                      <TableHead className="whitespace-nowrap">Revisado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(row => (
                      <OrderRow key={`${row.userId}::${row.date}`} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}