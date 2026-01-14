"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "../contexts/theme-context"
import { useFormData } from "../contexts/formRegister-context"
import { Header } from "./header"
import { CheckCircle, ArrowLeft, ArrowRight, CheckCheck, PartyPopper, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { TypeForm } from "./dashboard-register"
import { useEffect, useState } from "react"

export function DashboardConfirm() {
  const [loading, setLoading] = useState<boolean>(false)  
  const [success, setSuccess] = useState<boolean>(false)
  const { theme } = useTheme()
  const { data, clearData } = useFormData()
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
      clearData()

    } catch(err) {
      console.error(err)
      alert("Erro ao registrar. Tente novamente.")
     
    } finally {
      setLoading(false)
      
    }
  }

  
  if(loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center px-4 py-10">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Carregando...</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Processando Registro
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
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
            {/* MOSTRA CARD DE SUCESSO OU FORMULÁRIO */}
            {success ? (
             
              <div className="animate-in fade-in-50 slide-in-from-top-5 duration-300">
                <Card className={`
                  border-2 border-green-500/30
                  ${isDark 
                    ? "bg-gradient-to-br from-green-950/20 to-green-900/10" 
                    : "bg-gradient-to-br from-green-50 to-emerald-50"}
                `}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* ... conteúdo do card de sucesso ... */}
                      <div className="flex gap-3 w-full pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.replace('/dashboardRegister')}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Voltar
                        </Button>
                        
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => router.push('/dashboard')}
                        >
                          Ir para Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              
              <>
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
                  <h3 className="text-lg font-semibold mb-4">Empresa</h3>
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
                              <span key={idx} className={isDark ? "text-white" : "text-neutral-700"}>
                                {sub.name}
                                {sub.quantity !== undefined && ` QTD: ${sub.quantity}  `}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto md:flex-1"
                    onClick={() => router.replace('/dashboardRegister')}
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>

                  <Button 
                    className="w-full md:w-auto md:flex-1" 
                    onClick={() => data && sendForm(data)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Confirmar Cadastro"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}