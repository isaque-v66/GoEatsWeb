"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "../contexts/theme-context"
import { useFormData } from "../contexts/formRegister-context"
import { Header } from "./header"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { TypeForm } from "./dashboard-register"
import { useState } from "react"

export function DashboardConfirm() {
  const [loading, setLoading] = useState<Boolean>(false)
  const [success, setSuccess] = useState<Boolean>(false)
  const { theme } = useTheme()
  const { data } = useFormData()
  const router = useRouter()

  const isDark = theme === "dark"



  async function sendForm(data: TypeForm) {
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
                defaultQuantity: item.quantity,
                subcategories: item.subcategories?.map(sub => ({
                name: sub.name,
                defaultQuantity: sub.quantity
                }))
            }))
            }




            const req = await fetch('/api/registerUser', {
                method: "POST",
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify(payload)
            })


            if(!req.ok) {
                throw new Error("Erro na requisição de registro à API")
            }


        console.log("Usuário registrado com sucesso")
        setSuccess(true)



     } catch(err) {
        console.log(err)
        throw new Error("Erro ao entrar em contato com a API para registro")

     } finally {
        setLoading(false)
        setSuccess(false)
     }

  }




  if(loading) {
    <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            <span>Carregando...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Processando seu registro
        </CardContent>
      </Card>
  }





  return (
    <div >
      <Header />
      <div className="flex justify-center px-4 py-10">
        <Card className="w-full max-w-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Confirmação de Dados
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* DADOS DO USUÁRIO */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Usuário</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="mt-1 text-sm">{data?.email}</p>
                </div>

                <div>
                  <Label>CNPJ</Label>
                  <p className="mt-1 text-sm">{data?.cnpj}</p>
                </div>
              </div>
            </section>

            {/* EMPRESA */}
            <section>
              <h3 className="text-lg font-semibold mb-4"></h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <p className="mt-1 text-sm">{data?.company}</p>
                </div>

                <div>
                  <Label>Nome Social</Label>
                  <p className="mt-1 text-sm">{data?.nomeSocial}</p>
                </div>
              </div>
            </section>


            

            {/* ITENS */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Itens Disponíveis</h3>

              <div className="space-y-2">
                {data?.items?.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      flex justify-between items-center p-3 rounded-lg border
                      ${isDark
                        ? "border-neutral-700 bg-neutral-800"
                        : "border-neutral-200 bg-white"}
                    `}
                  >
                    <span className="font-medium">{item.item}</span>

                    {item.subcategories && (
                      <span className="text-sm text-neutral-500">
                         {item.subcategories.map((sub, idx) => (
                        <span key={idx}>
                            {sub.name}
                            {sub.quantity !== undefined && ` QTD: ${sub.quantity} | `}
                        </span>
                        ))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* AÇÕES */}
            <div className="flex-col md:flex-row gap-4 pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.replace('/dashboardRegister')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              <Button className="w-full mt-4"  onClick={() => data && sendForm(data)}>
                Confirmar Cadastro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
