"use client"

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Building2, Hash, ClipboardList } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { UsersTable } from "../types/table-types"
import { MEAL_TYPE_MAP } from "../../register/types/register-types"

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

function formatQty(config: { weekdayQuantity: number | null; saturdayQuantity: number | null; sundayQuantity: number | null }) {
  const parts = []
  if (config.weekdayQuantity !== null) parts.push(`Seg-Sex: ${config.weekdayQuantity}`)
  if (config.saturdayQuantity !== null) parts.push(`Sáb: ${config.saturdayQuantity}`)
  if (config.sundayQuantity !== null) parts.push(`Dom: ${config.sundayQuantity}`)
  return parts.length > 0 ? parts.join(" · ") : "Sem quantidade definida"
}

export function ViewUserDialog({ openViewDialog, setOpenViewDialog, selectedUser }: ViewUserDialogProps) {
  if (!selectedUser) return null

  // agrupa por tipo de refeição
  const grouped = selectedUser.itemConfigs.reduce<Record<string, UsersTable["itemConfigs"]>>(
    (acc, config) => {
      const key = config.item.mealType
      if (!acc[key]) acc[key] = []
      acc[key].push(config)
      return acc
    },
    {}
  )

  return (
    <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-muted text-sm font-medium text-foreground">
                {selectedUser.company.socialName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {selectedUser.company.socialName}
              </DialogTitle>
              <Badge
                variant={selectedUser.role === "ADMIN" ? "default" : "secondary"}
                className="text-[10px] mt-1"
              >
                {selectedUser.role === "ADMIN" ? "Admin" : "Usuário"}
              </Badge>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Detalhes do usuário {selectedUser.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="text-sm font-medium mt-0.5 break-all">{selectedUser.email}</p>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> CNPJ
              </p>
              <p className="text-sm font-medium mt-0.5 font-mono">
                {formatCNPJ(selectedUser.company.cnpj)}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 sm:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Empresa
              </p>
              <p className="text-sm font-medium mt-0.5">{selectedUser.company.socialName}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5 mb-2">
              <ClipboardList className="w-3 h-3" /> Configuração de pedidos
            </p>

            {selectedUser.itemConfigs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum item configurado para este usuário
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(grouped).map(([mealType, configs]) => (
                  <div key={mealType} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-foreground mb-2">
                      {MEAL_TYPE_LABELS[mealType] ?? mealType}
                    </p>
                    <div className="space-y-2">
                      {configs.map(config => (
                        <div key={config.id} className="text-sm">
                          {config.subcategories.length > 0 ? (
                            <div className="space-y-1.5">
                              <span className="text-muted-foreground">{config.item.name}</span>
                              <div className="pl-3 space-y-1 border-l-2 border-border ml-1">
                                {config.subcategories.map(sub => (
                                  <div key={sub.id} className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">{sub.subcategory.name}</span>
                                    <Badge variant="outline" className="text-[10px] font-normal whitespace-nowrap">
                                      {formatQty(sub)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">{config.item.name}</span>
                              <Badge variant="outline" className="text-[10px] font-normal whitespace-nowrap">
                                {formatQty(config)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}