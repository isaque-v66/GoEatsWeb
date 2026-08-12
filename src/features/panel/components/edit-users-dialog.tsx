"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Plus, Check, Eye, EyeOff, AlertCircle } from "lucide-react"
import { UsersTable } from "../types/table-types"
import { Dispatch, SetStateAction } from "react"
import { updateUserTable } from "../services/table.service"
import toast from "react-hot-toast"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  EditUserForm, EditUserSchema,
  ITEM_VALUES, ITEMS_WITH_SUBCATEGORY, ItemType, MEAL_TYPE_MAP,
  SelectedItem, SUBCATEGORIES_DRINKS, SUBCATEGORIES_ESPECIAL, SUBCATEGORIES_LANCHE,
  SUBCATEGORIES_DESJEJUM, SUBCATEGORIES_VALUES,
  Subcategory } from "../../register/types/register-types"
import { Textarea } from "@/components/ui/textarea"




type QuantityField =
  | "mondayQuantity"
  | "tuesdayQuantity"
  | "wednesdayQuantity"
  | "thursdayQuantity"
  | "fridayQuantity"
  | "saturdayQuantity"
  | "sundayQuantity"

const DAY_COLUMNS: { label: string; field: QuantityField }[] = [
  { label: "Seg", field: "mondayQuantity" },
  { label: "Ter", field: "tuesdayQuantity" },
  { label: "Qua", field: "wednesdayQuantity" },
  { label: "Qui", field: "thursdayQuantity" },
  { label: "Sex", field: "fridayQuantity" },
  { label: "Sáb", field: "saturdayQuantity" },
  { label: "Dom", field: "sundayQuantity" },
]

type EditUsersDialogProps = {
  openEditDialog: boolean
  setOpenEditDialog: Dispatch<SetStateAction<boolean>>
  selectedUser: UsersTable | null
}










function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  let masked = digits
  if (digits.length > 2) masked = `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length > 5) masked = `${masked.slice(0, 6)}.${masked.slice(6)}`
  if (digits.length > 8) masked = `${masked.slice(0, 10)}/${masked.slice(10)}`
  if (digits.length > 12) masked = `${masked.slice(0, 15)}-${masked.slice(15)}`
  return masked
}

function toSelectedItems(itemConfigs: UsersTable["itemConfigs"]): SelectedItem[] {
  return itemConfigs.map(config => ({
    item: config.item.name as ItemType,
    mondayQuantity: config.mondayQuantity ?? undefined,
    tuesdayQuantity: config.tuesdayQuantity ?? undefined,
    wednesdayQuantity: config.wednesdayQuantity ?? undefined,
    thursdayQuantity: config.thursdayQuantity ?? undefined,
    fridayQuantity: config.fridayQuantity ?? undefined,
    saturdayQuantity: config.saturdayQuantity ?? undefined,
    sundayQuantity: config.sundayQuantity ?? undefined,
    comment: config.comment ?? undefined,
    subcategories: config.subcategories.length > 0
      ? config.subcategories.map(sub => ({
          name: sub.subcategory.name as Subcategory,
          mondayQuantity: sub.mondayQuantity ?? undefined,
          tuesdayQuantity: sub.tuesdayQuantity ?? undefined,
          wednesdayQuantity: sub.wednesdayQuantity ?? undefined,
          thursdayQuantity: sub.thursdayQuantity ?? undefined,
          fridayQuantity: sub.fridayQuantity ?? undefined,
          saturdayQuantity: sub.saturdayQuantity ?? undefined,
          sundayQuantity: sub.sundayQuantity ?? undefined,
        }))
      : undefined,
  }))
}

export function EditUsersDialog({ openEditDialog, setOpenEditDialog, selectedUser }: EditUsersDialogProps) {
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [ativo, setAtivo] = useState(true)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<EditUserForm>({
    resolver: zodResolver(EditUserSchema),
  })

  useEffect(() => {
    if (!selectedUser) return

    reset({
      email: selectedUser.email,
      role: selectedUser.role as "ADMIN" | "USER",
      company: selectedUser.company.socialName,
      cnpj: maskCNPJ(selectedUser.company.cnpj),
      password: "",
    })

    const items = toSelectedItems(selectedUser.itemConfigs)
    setSelectedItems(items)

    const hasQuantities = items.some(i =>
      DAY_COLUMNS.some(({ field }) => i[field] !== undefined) ||
      i.subcategories?.some(s => DAY_COLUMNS.some(({ field }) => s[field] !== undefined))
    )
    setAtivo(hasQuantities)
  }, [selectedUser, reset])

  const cnpjValue = watch("cnpj") ?? ""





  function handleCnpjChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("cnpj", maskCNPJ(e.target.value), { shouldValidate: true, shouldDirty: true })
  }





  function itemSelect(item: ItemType) {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.item === item)
      return exists ? prev.filter(i => i.item !== item) : [...prev, { item }]
    })
  }





  function toggleSubcategory(item: ItemType, sub: Subcategory) {
    setSelectedItems(prev => prev.map(i => {
      if (i.item !== item) return i
      const current = i.subcategories ?? []
      const exists = current.find(s => s.name === sub)
      return {
        ...i,
        subcategories: exists ? current.filter(s => s.name !== sub) : [...current, { name: sub }],
      }
    }))
  }





  function setSubcategoryQuantity(item: ItemType, sub: Subcategory, field: QuantityField, quantity: number) {
    setSelectedItems(prev => prev.map(i => {
      if (i.item !== item) return i
      return {
        ...i,
        subcategories: i.subcategories?.map(s => s.name === sub ? { ...s, [field]: quantity } : s),
      }
    }))
  }





  function setQuantity(item: ItemType, field: QuantityField, quantity: number) {
    setSelectedItems(prev => prev.map(i => i.item === item ? { ...i, [field]: quantity } : i))
  }






  const updateUserMutation = useMutation({
    mutationFn: updateUserTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário atualizado")
      setOpenEditDialog(false)
    },
    onError: () => toast.error("Erro ao atualizar o usuário"),
  })






  async function handleUpdate(data: EditUserForm) {
  if (!selectedUser) return

  const items = selectedItems.map(item => {
    const hasSub = !!item.subcategories?.length

    const dayQuantities = !hasSub && ativo
      ? {
          mondayQuantity: item.mondayQuantity,
          tuesdayQuantity: item.tuesdayQuantity,
          wednesdayQuantity: item.wednesdayQuantity,
          thursdayQuantity: item.thursdayQuantity,
          fridayQuantity: item.fridayQuantity,
          saturdayQuantity: item.saturdayQuantity,
          sundayQuantity: item.sundayQuantity,
        }
      : {}

    return {
      name: item.item,
      mealType: MEAL_TYPE_MAP[item.item],
      ...dayQuantities,
      comment: item.comment?.trim() || undefined,
      subcategories: hasSub
        ? item.subcategories?.map(sub => ({
            name: sub.name,
            ...(ativo
              ? {
                  mondayQuantity: sub.mondayQuantity,
                  tuesdayQuantity: sub.tuesdayQuantity,
                  wednesdayQuantity: sub.wednesdayQuantity,
                  thursdayQuantity: sub.thursdayQuantity,
                  fridayQuantity: sub.fridayQuantity,
                  saturdayQuantity: sub.saturdayQuantity,
                  sundayQuantity: sub.sundayQuantity,
                }
              : {}),
          }))
        : undefined,
    }
  })

  updateUserMutation.mutate({
    id: selectedUser.id,
    email: dirtyFields.email && data.email ? data.email : undefined,
    password: data.password ? data.password : undefined,
    role: dirtyFields.role && data.role ? data.role : undefined,
    company: dirtyFields.company && data.company ? data.company : undefined,
    cnpj: dirtyFields.cnpj && data.cnpj ? data.cnpj.replace(/\D/g, "") : undefined,
    items,
  })
}




function setComment(item: ItemType, comment: string) {
  setSelectedItems(prev =>
    prev.map(i =>
      i.item === item
        ? { ...i, comment }
        : i
    )
  )
}



  return (
    <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Editar usuário
          </DialogTitle>
          <DialogDescription className="text-sm">
            Altere os dados da empresa, acesso e configuração de pedidos
          </DialogDescription>
        </DialogHeader>

        {selectedUser && (
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input id="email" {...register("email")} className="h-9 text-sm" />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Deixe em branco para manter"
                    className="h-9 text-sm pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nome da empresa
                </Label>
                <Input id="company" {...register("company")} className="h-9 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cnpj" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  value={cnpjValue}
                  onChange={handleCnpjChange}
                  maxLength={18}
                  inputMode="numeric"
                  className="h-9 text-sm"
                />
                {errors.cnpj && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.cnpj.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Perfil
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="USER">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Label htmlFor="ativo-switch" className="text-sm cursor-pointer">
                Definir quantidades
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{ativo ? "Sim" : "Não"}</span>
                <Switch id="ativo-switch" checked={ativo} onCheckedChange={setAtivo} />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Itens configurados
              </p>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {ITEM_VALUES.map(item => {
                  const selected = selectedItems.find(i => i.item === item)
                  const isDrink = item === "Bebidas"
                  const isEspecial = item === "Pedidos Especiais"
                  const isLanche = item === "Lanche"
                  const isDesjejum = item === "Desjejum"

                  const isFoodWithSub =
                    !isDrink &&
                    !isEspecial &&
                    !isLanche &&
                    !isDesjejum &&
                    ITEMS_WITH_SUBCATEGORY.includes(item)

                  const subcategories = isDrink
                    ? SUBCATEGORIES_DRINKS
                    : isEspecial
                      ? SUBCATEGORIES_ESPECIAL
                      : isLanche
                        ? SUBCATEGORIES_LANCHE
                        : isFoodWithSub
                          ? SUBCATEGORIES_VALUES
                          : isDesjejum
                            ? SUBCATEGORIES_DESJEJUM
                            : null

                  return (
                    <div key={item}>
                      <button
                        type="button"
                        onClick={() => itemSelect(item)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-background text-foreground border-border hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-600/10 dark:hover:text-orange-400 dark:hover:border-orange-600"
                        }`}
                      >
                        {selected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0" />}
                        {item}
                      </button>

                      {selected && !subcategories && ativo && (
                         <div className="mt-2 mb-1 pl-3 grid grid-cols-4 sm:grid-cols-7 gap-2 border-l-2 border-orange-200 ml-2">
                          {DAY_COLUMNS.map(({ label, field }) => (
                            <div key={field} className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground">{label}</Label>
                              <Input
                                type="number"
                                min={0}
                                value={selected[field] ?? ""}
                                onChange={e => setQuantity(item, field, Number(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {selected && subcategories && (
                        <div className="mt-2 mb-1 pl-3 space-y-2 border-l-2 border-orange-200 ml-2">
                          {subcategories.map(sub => {
                            const selectedSub = selected.subcategories?.find(s => s.name === sub)
                            return (
                              <div key={sub} className="space-y-1.5">
                                <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
                                  <Checkbox
                                    checked={!!selectedSub}
                                    onCheckedChange={() => toggleSubcategory(item, sub)}
                                    className="shrink-0"
                                  />
                                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    {sub}
                                  </span>
                                  {selectedSub && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal ml-auto">
                                      configurado
                                    </Badge>
                                  )}
                                </label>

                                {selectedSub && ativo && (
                                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pl-6">
                                    {DAY_COLUMNS.map(({ label, field }) => (
                                      <div key={field} className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">{label}</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={selectedSub[field] ?? ""}
                                          onChange={e => setSubcategoryQuantity(item, sub, field, Number(e.target.value))}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    ))}

                                    
                                  </div>

                                  
                                )}
                              </div>
                            )
                          })}
                          {selected && (
                              <div className="mt-2 mb-2 pl-3 ml-2">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  Observações (opcional)
                                </Label>

                                <Textarea
                                  value={selected.comment ?? ""}
                                  onChange={e => setComment(item, e.target.value)}
                                  placeholder="Ex: sem cebola, embalagem separada..."
                                  className="mt-1 text-sm min-h-[60px] resize-none"
                                  maxLength={500}
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}