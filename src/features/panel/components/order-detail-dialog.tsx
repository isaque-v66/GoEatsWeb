"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  CalendarDays,
  Building2,
  FileText,
} from "lucide-react"
import { UserDayRow, MEAL_LABELS } from "../hooks/useAdminOrders"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: UserDayRow | null
}

const SOURCE_LABELS: Record<string, string> = {
  normal: "Pedido do dia",
  scheduled: "Pedido especial agendado",
  projection: "Quantidade padrão",
  fallback: "Repetição do pedido anterior",
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  row,
}: Props) {
  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
     
<DialogContent
  className="
    flex
    max-h-[88vh]
    flex-col
    overflow-hidden
    p-0
    sm:max-w-xl
    border-neutral-200
    dark:border-neutral-800
    bg-white
    dark:bg-neutral-950
  "
>
  {/* Header */}
  <DialogHeader
    className="
      relative
      shrink-0
      overflow-hidden
      border-b
      border-neutral-200
      dark:border-neutral-800
      px-5
      py-5
    "
  >
    {/* Glow laranja */}
    <div
      className="
        pointer-events-none
        absolute
        -right-20
        -top-24
        h-48
        w-48
        rounded-full
        bg-orange-200/20
        blur-3xl
        dark:bg-orange-500/10
      "
    />

    <div className="relative flex items-start gap-3">
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-orange-50
          text-orange-500
          dark:bg-orange-500/10
          dark:text-orange-400
        "
      >
        <FileText className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <DialogTitle
          className="
            truncate
            text-base
            font-semibold
            tracking-tight
            text-neutral-900
            dark:text-white
          "
        >
          {row.companyName}
        </DialogTitle>

        <DialogDescription
          className="
            mt-1
            flex
            items-center
            gap-1.5
            text-xs
            text-neutral-500
            dark:text-neutral-400
          "
        >
          <CalendarDays className="h-3.5 w-3.5" />

          {format(
            parseISO(row.date),
            "EEEE, dd 'de' MMMM 'de' yyyy",
            { locale: ptBR }
          )}
        </DialogDescription>
      </div>
    </div>
  </DialogHeader>

  {/* Área rolável */}
  <div
    className="
      min-h-0
      flex-1
      overflow-y-auto
      overscroll-contain
      px-5
      py-4
      scrollbar-thin
    "
  >
    <div className="space-y-5">

      {/* Informações gerais */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

        {/* CNPJ */}
        <div
          className="
            rounded-xl
            border
            border-neutral-200
            bg-neutral-50/70
            px-3.5
            py-3
            dark:border-neutral-800
            dark:bg-neutral-900/60
          "
        >
          <div className="flex items-center gap-1.5">
            <Building2
              className="
                h-3.5
                w-3.5
                text-orange-500
                dark:text-orange-400
              "
            />

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-neutral-500
                dark:text-neutral-400
              "
            >
              CNPJ
            </p>
          </div>

          <p
            className="
              mt-1
              font-mono
              text-xs
              font-medium
              text-neutral-800
              dark:text-neutral-200
            "
          >
            {row.cnpj}
          </p>
        </div>

        {/* Status */}
        <div
          className={`
            rounded-xl
            border
            px-3.5
            py-3
            ${
              row.reviewedAt
                ? "border-green-200 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20"
                : "border-orange-200 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/20"
            }
          `}
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-neutral-500
              dark:text-neutral-400
            "
          >
            Status
          </p>

          <div className="mt-1.5 flex items-center gap-1.5">
            {row.reviewedAt ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />

                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Pedido revisado
                </span>
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />

                <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                  Pendente de revisão
                </span>
              </>
            )}
          </div>

          {row.reviewedAt && (
            <p className="mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
              Revisado em{" "}
              {format(
                parseISO(row.reviewedAt),
                "dd/MM 'às' HH:mm"
              )}
            </p>
          )}
        </div>
      </div>

      {/* Detalhes */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-orange-500" />

          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Detalhes do pedido
            </p>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Itens e quantidades solicitadas
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {row.meals.map((meal, mi) => (
            <div
              key={mi}
              className="
                overflow-hidden
                rounded-xl
                border
                border-neutral-200
                bg-white
                shadow-sm
                dark:border-neutral-800
                dark:bg-neutral-900
              "
            >
              {/* Refeição */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-neutral-200
                  bg-neutral-50/80
                  px-3.5
                  py-2.5
                  dark:border-neutral-800
                  dark:bg-neutral-800/50
                "
              >
                <div className="flex items-center gap-2">
                  <div
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-orange-500
                      shadow-sm
                      shadow-orange-500/40
                    "
                  />

                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {meal.mealType !== "ESPECIAL"
                      ? MEAL_LABELS[meal.mealType] ??
                        meal.mealType
                      : "Pedido especial"}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="
                    h-5
                    rounded-md
                    bg-orange-50
                    px-1.5
                    text-[10px]
                    font-medium
                    text-orange-700
                    dark:bg-orange-500/10
                    dark:text-orange-400
                  "
                >
                  {meal.items.length}{" "}
                  {meal.items.length === 1 ? "item" : "itens"}
                </Badge>
              </div>

              {/* Itens */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {meal.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="
                      px-3.5
                      py-3
                      transition-colors
                      hover:bg-orange-50/30
                      dark:hover:bg-orange-500/[0.03]
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {item.itemName}

                          {item.subcategoryName && (
                            <span className="font-normal text-neutral-500 dark:text-neutral-400">
                              {" "}· {item.subcategoryName}
                            </span>
                          )}
                        </p>

                        {item.source && (
                          <Badge
                            variant="outline"
                            className="
                              mt-1.5
                              h-5
                              rounded-md
                              border-neutral-200
                              bg-neutral-50
                              px-1.5
                              text-[10px]
                              font-normal
                              text-neutral-500
                              dark:border-neutral-700
                              dark:bg-neutral-800
                              dark:text-neutral-400
                            "
                          >
                            {SOURCE_LABELS[item.source] ??
                              item.source}
                          </Badge>
                        )}
                      </div>

                      {/* Quantidade */}
                      <div
                        className="
                          flex
                          h-9
                          min-w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-orange-200
                          bg-orange-50
                          px-2.5
                          dark:border-orange-900/50
                          dark:bg-orange-500/10
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-bold
                            tabular-nums
                            text-orange-600
                            dark:text-orange-400
                          "
                        >
                          {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Comentário */}
                    {item.comment?.trim() && (
                      <div
                        className="
                          mt-2.5
                          flex
                          items-start
                          gap-2
                          rounded-lg
                          border
                          border-orange-100
                          bg-orange-50/60
                          px-2.5
                          py-2
                          dark:border-orange-900/40
                          dark:bg-orange-500/[0.06]
                        "
                      >
                        <div
                          className="
                            mt-0.5
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            bg-orange-100
                            text-orange-600
                            dark:bg-orange-500/10
                            dark:text-orange-400
                          "
                        >
                          <MessageSquare className="h-3 w-3" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                            Observação
                          </p>

                          <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div
        className="
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-dashed
          border-orange-200
          bg-orange-50/40
          px-3
          py-2.5
          dark:border-orange-900/40
          dark:bg-orange-500/[0.04]
        "
      >
        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-orange-500 dark:text-orange-400" />

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          As observações exibidas são as informações adicionadas
          ao pedido pelo usuário.
        </p>
      </div>
    </div>
  </div>
</DialogContent>

    </Dialog>
  )
}
