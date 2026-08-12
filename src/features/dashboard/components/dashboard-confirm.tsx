"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "../../../shared/contexts/theme-context"
import { useFormData } from "../../register/contexts/formRegister-context"
import { Header } from "../../../shared/components/header"
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { TypeForm } from "../../register/types/register-types"
import { useEffect, useState } from "react"




type DayField =
  | "mondayQuantity"
  | "tuesdayQuantity"
  | "wednesdayQuantity"
  | "thursdayQuantity"
  | "fridayQuantity"
  | "saturdayQuantity"
  | "sundayQuantity"

const DAY_COLUMNS: { label: string; mobileLabel: string; field: DayField }[] = [
  { label: "Seg", mobileLabel: "Segunda", field: "mondayQuantity" },
  { label: "Ter", mobileLabel: "Terça", field: "tuesdayQuantity" },
  { label: "Qua", mobileLabel: "Quarta", field: "wednesdayQuantity" },
  { label: "Qui", mobileLabel: "Quinta", field: "thursdayQuantity" },
  { label: "Sex", mobileLabel: "Sexta", field: "fridayQuantity" },
  { label: "Sáb", mobileLabel: "Sábado", field: "saturdayQuantity" },
  { label: "Dom", mobileLabel: "Domingo", field: "sundayQuantity" },
]



const ITEM_TO_MEAL = {
  "Desjejum": "DESJEJUM",
  "Almoço": "ALMOCO",
  "Jantar": "JANTAR",
  "Ceia": "CEIA",
  "Lanche": "LANCHE",
  "Bebidas": "BEBIDAS",
  "Café da tarde": "CAFE_TARDE",
  "Café noturno": "CAFE_NOTURNO",
  "Pedidos Especiais": "PEDIDOS_ESPECIAIS"
} as const

type ItemKey = keyof typeof ITEM_TO_MEAL



export function DashboardConfirm() {
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const { theme } = useTheme()
  const { data, clearData } = useFormData()
  const router = useRouter()

  const isDark = theme === "dark"


  useEffect(() => {
    if (!data) {
      router.replace("/dashboardRegister")
    }
  }, [data, router])

  if (!data) {
    return null
  }



  async function sendForm(data: TypeForm) {
    if (loading) return

    try {
      setLoading(true)
      setSuccess(false)

      const payload = {
        user: {
          email: data.email,
          password: data.password,
        },
        company: {
          cnpj: data.cnpj,
          socialName: data.nomeSocial,
        },
        items: data.items.map(item => ({
        name: item.item,
        mealType: ITEM_TO_MEAL[item.item as ItemKey],

        mondayQuantity: item.subcategories?.length ? null : item.mondayQuantity ?? null,
        tuesdayQuantity: item.subcategories?.length ? null : item.tuesdayQuantity ?? null,
        wednesdayQuantity: item.subcategories?.length ? null : item.wednesdayQuantity ?? null,
        thursdayQuantity: item.subcategories?.length ? null : item.thursdayQuantity ?? null,
        fridayQuantity: item.subcategories?.length ? null : item.fridayQuantity ?? null,
        saturdayQuantity: item.subcategories?.length ? null : item.saturdayQuantity ?? null,
        sundayQuantity: item.subcategories?.length ? null : item.sundayQuantity ?? null,

        comment: item.comment ?? null,

        subcategories: item.subcategories?.map(sub => ({
          name: sub.name,
          mondayQuantity: sub.mondayQuantity ?? null,
          tuesdayQuantity: sub.tuesdayQuantity ?? null,
          wednesdayQuantity: sub.wednesdayQuantity ?? null,
          thursdayQuantity: sub.thursdayQuantity ?? null,
          fridayQuantity: sub.fridayQuantity ?? null,
          saturdayQuantity: sub.saturdayQuantity ?? null,
          sundayQuantity: sub.sundayQuantity ?? null,
        })) ?? [],
      })),
      }



      const req = await fetch("/api/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const res = await req.json()


      if (!req.ok) {
        throw new Error(res?.message || "Erro ao registrar usuário")
      }

      setSuccess(true)

    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao registrar"
      )
    } finally {
      setLoading(false)
    }
  }






 
if (loading) {
  return (
    <div className="min-h-screen bg-muted/40">
      <Header />

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
              <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
            </div>

            <h2 className="text-lg font-semibold">
              Processando cadastro
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Estamos criando o usuário e configurando os itens selecionados.
            </p>

            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-orange-500" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

return (
  <div className="min-h-screen bg-muted/40">
    <Header />

    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      {/* CABEÇALHO */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
            <CheckCircle className="h-5 w-5 text-orange-500" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Confirmar cadastro
            </h1>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Revise os dados antes de concluir o cadastro.
            </p>
          </div>
        </div>
      </div>

      {success ? (
       
        <Card className="mx-auto max-w-2xl overflow-hidden shadow-sm">
          <CardContent className="px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
              <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Cadastro realizado!
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              O usuário foi cadastrado com sucesso e já pode acessar o sistema
              utilizando as credenciais informadas.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <p className="text-muted-foreground">
                Usuário cadastrado
              </p>

              <p className="mt-1 font-medium">
                {data.email}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:flex-1"
                onClick={() => {
                  clearData()
                  router.replace("/dashboardRegister")
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Novo cadastro
              </Button>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
                onClick={() => {
                  clearData()
                  router.push("/login")
                }}
              >
                Ir para o login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            
            <Card className="shadow-sm">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Usuário
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Email
                  </Label>

                  <p className="mt-1.5 truncate text-sm font-medium">
                    {data.email}
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    CNPJ
                  </Label>

                  <p className="mt-1.5 text-sm font-medium">
                    {data.cnpj}
                  </p>
                </div>
              </CardContent>
            </Card>

      
            <Card className="shadow-sm">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Empresa
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Nome da empresa
                  </Label>

                  <p className="mt-1.5 truncate text-sm font-medium">
                    {data.company}
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">
                    Nome social
                  </Label>

                  <p className="mt-1.5 truncate text-sm font-medium">
                    {data.nomeSocial}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Itens e quantidades
                  </CardTitle>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Confira os itens selecionados e suas quantidades.
                  </p>
                </div>

                <div className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {data.items.length}{" "}
                  {data.items.length === 1 ? "item" : "itens"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {data.items.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Nenhum item selecionado.
                </div>
              ) : (
                <div className="divide-y">
                  {/* CABEÇALHO DESKTOP */}
                  <div className="hidden grid-cols-[minmax(200px,1fr)_repeat(7,80px)] items-center gap-4 bg-muted/30 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                    <span>Item</span>

                    {DAY_COLUMNS.map(({ label, field }) => (
                      <span key={field} className="text-center">
                        {label}
                      </span>
                    ))}
                  </div>

                  {data.items.map(
                    (
                      item: TypeForm["items"][number],
                      index: number
                    ) => (
                      <div
                        key={`${item.item}-${index}`}
                        className="px-5 py-4 transition-colors hover:bg-muted/20"
                      >
                        {/* ITEM SEM SUBCATEGORIA */}
                        {!item.subcategories?.length ? (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(200px,1fr)_repeat(7,80px)] sm:items-center sm:gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              {item.item}
                            </p>

                            {item.comment && (
                              <p className="mt-1 text-xs text-muted-foreground italic">
                                "{item.comment}"
                              </p>
                            )}
                          </div>

                          {DAY_COLUMNS.map(({ label, mobileLabel, field }) => (
                            <div
                              key={field}
                              className="flex items-center justify-between sm:block sm:text-center"
                            >
                              <span className="text-xs text-muted-foreground sm:hidden">
                                {mobileLabel}
                              </span>

                              <span className="text-sm font-medium">
                                {item[field] ?? "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                        ) : (
                          /* ITEM COM SUBCATEGORIAS */
                          <div>
                            <div className="mb-3">
                               <p className="text-sm font-semibold">
                                  {item.item}
                                </p>

                                {item.comment && (
                                  <p className="mt-1 text-xs text-muted-foreground italic">
                                    "{item.comment}"
                                  </p>
                                )}

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {item.subcategories.length}{" "}
                                {item.subcategories.length === 1
                                  ? "opção selecionada"
                                  : "opções selecionadas"}
                              </p>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                              <div className="hidden grid-cols-[minmax(160px,1fr)_repeat(7,80px)] items-center gap-4 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                                <span>Opção</span>

                                {DAY_COLUMNS.map(({ label, field }) => (
                                  <span key={field} className="text-center">
                                    {label}
                                  </span>
                                ))}
                              </div>
                              {item.subcategories.map(
                                (sub, idx: number) => (
                                  <div
                                    key={`${sub.name}-${idx}`}
                                    className="grid grid-cols-1 gap-2 border-t px-4 py-3 first:border-t-0 sm:grid-cols-[minmax(160px,1fr)_repeat(7,80px)] sm:items-center sm:gap-4"
                                  >
                                    <p className="text-sm">
                                      {sub.name}
                                    </p>

                                    {DAY_COLUMNS.map(({ mobileLabel, field }) => (
                                      <div
                                        key={field}
                                        className="flex items-center justify-between sm:block sm:text-center"
                                      >
                                        <span className="text-xs text-muted-foreground sm:hidden">
                                          {mobileLabel}
                                        </span>

                                        <span className="text-sm font-medium">
                                          {sub[field] ?? "—"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-900/50 dark:bg-orange-950/20">
            <p className="text-xs leading-relaxed text-orange-800 dark:text-orange-300">
              <span className="font-semibold">Revise os dados antes de continuar.</span>{" "}
              Após confirmar o cadastro, o usuário será criado no sistema.
            </p>
          </div>

          
          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto sm:min-w-32"
              onClick={() => router.replace("/dashboardRegister")}
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="button"
              className="w-full bg-orange-500 hover:bg-orange-600 sm:w-auto sm:min-w-44"
              onClick={() => data && sendForm(data)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar cadastro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  </div>
)
}