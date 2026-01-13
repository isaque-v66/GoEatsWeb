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

export function DashboardConfirm() {
  const { theme } = useTheme()
  const { data } = useFormData()
  const router = useRouter()

  const isDark = theme === "dark"



  function sendForm(data: TypeForm) {

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

                    {item.subcategory && (
                      <span className="text-sm text-neutral-500">
                        {item.subcategory}
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
