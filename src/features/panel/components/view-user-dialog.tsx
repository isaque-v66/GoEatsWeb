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

// mealtype (ex: "ALMOCO") -> label legível (ex: "Almoço")
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

export function ViewUserDialog({ openViewDialog, setOpenViewDialog, selectedUser }: ViewUserDialogProps) {
  if (!selectedUser) return null

  // agrupa os itens por tipo de refeição
  const grouped = selectedUser.itemConfigs.reduce<Record<string, UsersTable["itemConfigs"]>>(
    (acc, config) => {
      const key = config.item.mealtype
      if (!acc[key]) acc[key] = []
      acc[key].push(config)
      return acc
    },
    {}
  )

  return (
    <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
      <DialogContent className="sm:max-w-lg">
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
          {/* Dados principais */}
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

          {/* Configuração de pedidos */}
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
                {Object.entries(grouped).map(([mealtype, configs]) => (
                  <div key={mealtype} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-foreground mb-2">
                      {MEAL_TYPE_LABELS[mealtype] ?? mealtype}
                    </p>
                    <div className="space-y-1.5">
                      {configs.map(config => (
                        <div
                          key={config.item.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="text-muted-foreground">{config.item.name}</span>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {config.defaultQuantity !== null
                              ? `Qtd: ${config.defaultQuantity}`
                              : "Sem quantidade definida"}
                          </Badge>
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