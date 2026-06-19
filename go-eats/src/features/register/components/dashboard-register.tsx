"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check, EyeOff, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useTheme } from "@/src/shared/contexts/theme-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { Header } from "@/src/shared/components/header"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useFormData } from "../contexts/formRegister-context"
import {
  ITEM_VALUES, ITEMS_WITH_SUBCATEGORY, ItemType, MEAL_TYPE_MAP,
  SelectedItem, SUBCATEGORIES_DRINKS, SUBCATEGORIES_VALUES,
  Subcategory, TypeForm, TypeSchemaForm,
} from "../types/register-types"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

// Máscara de CNPJ 
function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14)

  let masked = digits
  if (digits.length > 2) masked = `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length > 5) masked = `${masked.slice(0, 6)}.${masked.slice(6)}`
  if (digits.length > 8) masked = `${masked.slice(0, 10)}/${masked.slice(10)}`
  if (digits.length > 12) masked = `${masked.slice(0, 15)}-${masked.slice(15)}`

  return masked
}

export function DashboardRegister() {
  const [ativo, setAtivo] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { data, setData } = useFormData()
  const router = useRouter()
  const { theme } = useTheme()
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(data?.items ?? [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    watch,
  } = useForm<TypeForm>({
    resolver: zodResolver(TypeSchemaForm),
    defaultValues: data ?? { items: [] },
  })



  // Restaura os campos salvos quando o usuário volta do /confirm
  useEffect(() => {
    if (data) {
      setValue("email", data.email)
      setValue("password", data.password)
      setValue("company", data.company)
      setValue("nomeSocial", data.nomeSocial)
      setValue("cnpj", data.cnpj)
      setValue("items", data.items)
      setSelectedItems(data.items as SelectedItem[])
    }
    
  }, [])





  const cnpjValue = watch("cnpj") ?? ""

  function handleCnpjChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCNPJ(e.target.value)
    setValue("cnpj", masked, { shouldValidate: true })
  }

  function itemSelect(item: ItemType) {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.item === item)
      let updated: SelectedItem[]

      if (exists) {
        updated = prev.filter(i => i.item !== item)
      } else {
        updated = [...prev, { item }]
      }

      setValue("items", updated)
      return updated
    })
  }

  function toggleSubcategory(item: ItemType, sub: Subcategory) {
    setSelectedItems(prev => {
      const updated = prev.map(i => {
        if (i.item !== item) return i

        const current = i.subcategories ?? []
        const exists = current.find(s => s.name === sub)

        return {
          ...i,
          subcategories: exists
            ? current.filter(s => s.name !== sub)
            : [...current, { name: sub }],
        }
      })

      setValue("items", updated)
      return updated
    })
  }

  function setSubcategoryQuantity(
    item: ItemType,
    sub: Subcategory,
    field: "weekQuantity" | "saturdayQuantity" | "sundayQuantity",
    quantity: number
  ) {
    setSelectedItems(prev => {
      const updated = prev.map(i => {
        if (i.item !== item) return i
        return {
          ...i,
          subcategories: i.subcategories?.map(s =>
            s.name === sub ? { ...s, [field]: quantity } : s
          ),
        }
      })

      setValue("items", updated)
      return updated
    })
  }

  function setQuantity(
    item: ItemType,
    field: "weekQuantity" | "saturdayQuantity" | "sundayQuantity",
    quantity: number
  ) {
    setSelectedItems(prev => {
      const updated = prev.map(i => (i.item === item ? { ...i, [field]: quantity } : i))
      setValue("items", updated)
      return updated
    })
  }

  async function formHandle(form: TypeForm) {
    const cnpjLimpo = form.cnpj.replace(/\D/g, "")

    const normalizedForm = {
      ...form,
      cnpj: cnpjLimpo,
      items: form.items.map(item => {
        const hasSub = item.subcategories && item.subcategories.length > 0

        return {
          item: item.item,
          mealType: MEAL_TYPE_MAP[item.item],
          weekQuantity: hasSub ? undefined : ativo ? item.weekQuantity : undefined,
          saturdayQuantity: hasSub ? undefined : ativo ? item.saturdayQuantity : undefined,
          sundayQuantity: hasSub ? undefined : ativo ? item.sundayQuantity : undefined,
          subcategories: hasSub
            ? item.subcategories?.map(sub => ({
                name: sub.name,
                weekQuantity: ativo ? sub.weekQuantity : undefined,
                saturdayQuantity: ativo ? sub.saturdayQuantity : undefined,
                sundayQuantity: ativo ? sub.sundayQuantity : undefined,
              }))
            : undefined,
        }
      }),
    }

    
    try {
      const res = await fetch(`/api/checkCnpj?cnpj=${cnpjLimpo}`)
      const result = await res.json()

      if (result.exists) {
        setError("cnpj", {
          type: "manual",
          message: "Este CNPJ já está cadastrado",
        })
        return
      }
    } catch(err) {
      console.error("Falha ao verificar CNPJ:", err)
      
    }

    setData(normalizedForm)
    router.push("/confirm")
  }









  return (
    <div className="min-h-screen bg-muted/40">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Registrar novo usuário
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados abaixo para criar um acesso
          </p>
        </div>

        <form onSubmit={handleSubmit(formHandle)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Dados da empresa
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@empresa.com"
                    className={clsx("h-9 text-sm", errors.email && "border-destructive focus-visible:ring-destructive/30")}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={clsx("h-9 text-sm pr-10", errors.password && "border-destructive focus-visible:ring-destructive/30")}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nome da empresa
                  </Label>
                  <Input
                    id="company"
                    placeholder="ABS Company Plus"
                    className={clsx("h-9 text-sm", errors.company && "border-destructive focus-visible:ring-destructive/30")}
                    {...register("company")}
                  />
                  {errors.company && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nomeSocial" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nome social
                  </Label>
                  <Input
                    id="nomeSocial"
                    placeholder="Exemple LTDA"
                    className={clsx("h-9 text-sm", errors.nomeSocial && "border-destructive focus-visible:ring-destructive/30")}
                    {...register("nomeSocial")}
                  />
                  {errors.nomeSocial && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.nomeSocial.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cnpj" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={cnpjValue}
                    onChange={handleCnpjChange}
                    maxLength={18}
                    inputMode="numeric"
                    className={clsx("h-9 text-sm", errors.cnpj && "border-destructive focus-visible:ring-destructive/30")}
                  />
                  {errors.cnpj && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.cnpj.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sim-nao-switch" className="text-sm cursor-pointer">
                      Quantidades padrão?
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {ativo ? "Sim" : "Não"}
                      </span>
                      <Switch id="sim-nao-switch" checked={ativo} onCheckedChange={setAtivo} />
                    </div>
                  </div>
                  {ativo && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Defina as quantidades na coluna à direita
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Itens disponíveis
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-5 space-y-2">
                {ITEM_VALUES.map(item => {
                  const selected = selectedItems.find(i => i.item === item)
                  const isFoodWithSub = ITEMS_WITH_SUBCATEGORY.includes(item)
                  const isDrink = item === "Bebidas"
                  const subcategories = isFoodWithSub
                    ? SUBCATEGORIES_VALUES
                    : isDrink
                    ? SUBCATEGORIES_DRINKS
                    : null

                  return (
                    <div key={item}>
                      <button
                        type="button"
                        onClick={() => itemSelect(item)}
                        className={clsx(
                          "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                          selected
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-background text-foreground border-border hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-600/10 dark:hover:text-orange-400 dark:hover:border-orange-600"
                        )}
                      >
                        {selected ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0" />}
                        {item}
                      </button>

                      {selected && subcategories && (
                        <div className="mt-2 mb-1 pl-3 space-y-1.5 border-l-2 border-orange-200 ml-2">
                          {subcategories.map(sub => {
                            const selectedSub = selected.subcategories?.find(s => s.name === sub)
                            return (
                              <label key={sub} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
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
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            
            <div className="space-y-4">
              {ativo ? (
                <>
                  {selectedItems.filter(i => !ITEMS_WITH_SUBCATEGORY.includes(i.item)).map(item => (
                    <Card key={item.item} className="shadow-sm">
                      <CardHeader className="pb-3 border-b py-3 px-4">
                        <CardTitle className="text-sm font-medium">{item.item}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 px-4 pb-4 space-y-3">
                        {[
                          { label: "Segunda à Sexta", field: "weekQuantity" },
                          { label: "Sábado", field: "saturdayQuantity" },
                          { label: "Domingo", field: "sundayQuantity" },
                        ].map(({ label, field }) => {
                          const quantityField = field as "weekQuantity" | "saturdayQuantity" | "sundayQuantity"
                          return (
                            <div key={field} className="flex items-center justify-between gap-3">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">{label}</Label>
                              <Input
                                type="number"
                                min={0}
                                value={item[quantityField] ?? ""}
                                onChange={e => setQuantity(item.item, quantityField, Number(e.target.value))}
                                className="h-8 w-20 text-sm text-right"
                              />
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  ))}

                  {selectedItems
                    .filter(i => ITEMS_WITH_SUBCATEGORY.includes(i.item) || i.item === "Bebidas")
                    .map(item =>
                      item.subcategories?.map(sub => (
                        <Card key={`${item.item}-${sub.name}`} className="shadow-sm">
                          <CardHeader className="pb-3 border-b py-3 px-4">
                            <div>
                              <p className="text-xs text-muted-foreground">{item.item}</p>
                              <CardTitle className="text-sm font-medium mt-0.5">{sub.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4 px-4 pb-4 space-y-3">
                            {[
                              { label: "Segunda à Sexta", field: "weekQuantity" },
                              { label: "Sábado", field: "saturdayQuantity" },
                              { label: "Domingo", field: "sundayQuantity" },
                            ].map(({ label, field }) => (
                              <div key={field} className="flex items-center justify-between gap-3">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap">{label}</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={sub[field as keyof typeof sub] ?? ""}
                                  onChange={e =>
                                    setSubcategoryQuantity(item.item, sub.name, field as any, Number(e.target.value))
                                  }
                                  className="h-8 w-20 text-sm text-right"
                                />
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))
                    )}

                  {selectedItems.length === 0 && (
                    <Card className="shadow-sm border-dashed">
                      <CardContent className="py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                          Selecione itens na coluna ao lado para configurar quantidades
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="shadow-sm border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Ative "Quantidades padrão" para configurar
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full h-10 text-sm font-medium">
                  Cadastrar usuário
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 text-sm font-medium"
                  onClick={() => router.replace("/panel")}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}