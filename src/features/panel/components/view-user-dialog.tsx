"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Building2,
  Hash,
  ClipboardList,
  MessageSquare,
} from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { UsersTable } from "../types/table-types"
import { MEAL_TYPE_MAP } from "../../register/types/register-types"

type DayQuantities = {
  mondayQuantity: number | null
  tuesdayQuantity: number | null
  wednesdayQuantity: number | null
  thursdayQuantity: number | null
  fridayQuantity: number | null
  saturdayQuantity: number | null
  sundayQuantity: number | null
}

const DAY_COLUMNS: {
  label: string
  field: keyof DayQuantities
}[] = [
  { label: "S", field: "mondayQuantity" },
  { label: "T", field: "tuesdayQuantity" },
  { label: "Q", field: "wednesdayQuantity" },
  { label: "Q", field: "thursdayQuantity" },
  { label: "S", field: "fridayQuantity" },
  { label: "S", field: "saturdayQuantity" },
  { label: "D", field: "sundayQuantity" },
]

const DAY_NAMES: Record<keyof DayQuantities, string> = {
  mondayQuantity: "Segunda-feira",
  tuesdayQuantity: "Terça-feira",
  wednesdayQuantity: "Quarta-feira",
  thursdayQuantity: "Quinta-feira",
  fridayQuantity: "Sexta-feira",
  saturdayQuantity: "Sábado",
  sundayQuantity: "Domingo",
}

type ViewUserDialogProps = {
  openViewDialog: boolean
  setOpenViewDialog: Dispatch<SetStateAction<boolean>>
  selectedUser: UsersTable | null
}

// "ALMOCO" -> "Almoço"
const MEAL_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(MEAL_TYPE_MAP).map(([label, code]) => [code, label])
)

function formatCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "")

  if (digits.length !== 14) return cnpj

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

function hasAnyQuantity(config: DayQuantities) {
  return DAY_COLUMNS.some(({ field }) => config[field] !== null)
}

function QuantityDaysGrid({
  config,
}: {
  config: DayQuantities
}) {
  if (!hasAnyQuantity(config)) {
    return (
      <span className="text-[11px] text-muted-foreground italic">
        Sem quantidade definida
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {DAY_COLUMNS.map(({ label, field }) => {
        const value = config[field]
        const isSet = value !== null

        return (
          <div
            key={field}
            title={`${DAY_NAMES[field]}: ${
              isSet ? value : "Sem quantidade"
            }`}
            className={`flex h-8 w-7 flex-col items-center justify-center rounded-md border text-[10px] leading-none ${
              isSet
                ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-400"
                : "border-transparent bg-muted/30 text-muted-foreground/40"
            }`}
          >
            <span className="font-medium">
              {label}
            </span>

            <span className="mt-0.5 font-semibold tabular-nums">
              {isSet ? value : "–"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ViewUserDialog({
  openViewDialog,
  setOpenViewDialog,
  selectedUser,
}: ViewUserDialogProps) {
  if (!selectedUser) return null

  // Agrupa os itens por tipo de refeição
  const grouped = selectedUser.itemConfigs.reduce<
    Record<string, UsersTable["itemConfigs"]>
  >(
    (acc, config) => {
      const key = config.item.mealType

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(config)

      return acc
    },
    {}
  )

  return (
    <Dialog
      open={openViewDialog}
      onOpenChange={setOpenViewDialog}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-muted text-sm font-medium text-foreground">
                {selectedUser.company.socialName
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {selectedUser.company.socialName}
              </DialogTitle>

              <Badge
                variant={
                  selectedUser.role === "ADMIN"
                    ? "default"
                    : "secondary"
                }
                className="mt-1 text-[10px]"
              >
                {selectedUser.role === "ADMIN"
                  ? "Admin"
                  : "Usuário"}
              </Badge>
            </div>
          </div>

          <DialogDescription className="sr-only">
            Detalhes do usuário {selectedUser.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados do usuário */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3 w-3" />
                Email
              </p>

              <p className="mt-0.5 break-all text-sm font-medium">
                {selectedUser.email}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Hash className="h-3 w-3" />
                CNPJ
              </p>

              <p className="mt-0.5 font-mono text-sm font-medium">
                {formatCNPJ(selectedUser.company.cnpj)}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 sm:col-span-2">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-3 w-3" />
                Empresa
              </p>

              <p className="mt-0.5 text-sm font-medium">
                {selectedUser.company.socialName}
              </p>
            </div>
          </div>

          <Separator />

          {/* Configuração dos pedidos */}
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <ClipboardList className="h-3 w-3" />
              Configuração de pedidos
            </p>

            {selectedUser.itemConfigs.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum item configurado para este usuário
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(grouped).map(
                  ([mealType, configs]) => (
                    <div
                      key={mealType}
                      className="overflow-hidden rounded-lg border"
                    >
                      {/* Cabeçalho da refeição */}
                      <div className="border-b bg-muted/40 px-3 py-2">
                        <p className="text-xs font-semibold text-foreground">
                          {MEAL_TYPE_LABELS[mealType] ??
                            mealType}
                        </p>
                      </div>

                      {/* Itens da refeição */}
                      <div className="space-y-3 p-3">
                        {configs.map((config) => (
                          <div
                            key={config.id}
                            className="text-sm"
                          >
                            {config.subcategories.length > 0 ? (
                              <div className="space-y-2">
                                {/* Nome do item principal */}
                                <span className="text-sm font-medium text-muted-foreground">
                                  {config.item.name}
                                </span>

                                

                                {/* Subcategorias */}
                                <div className="ml-1 space-y-2 border-l-2 border-border pl-3">
                                  {config.subcategories.map(
                                    (sub) => (
                                      <div
                                        key={sub.id}
                                        className="flex flex-wrap items-center justify-between gap-2"
                                      >
                                        <span className="text-xs text-muted-foreground">
                                          {
                                            sub.subcategory
                                              .name
                                          }
                                        </span>

                                        <QuantityDaysGrid
                                          config={sub}
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {config.item.name}
                                </span>

                                <QuantityDaysGrid
                                  config={config}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
