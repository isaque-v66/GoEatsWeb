"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, LogOut, Coffee, Sandwich, Pizza, Cookie, Plus, ShoppingCart, Check } from "lucide-react"
import { OrderSummary } from "./order-summary"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { useTheme } from "../contexts/theme-context"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import clsx from "clsx"




const ITENS = [
     {nome: "Desjejum"},
     {nome: "Almoço"},
     {nome: "Ceia"},
     {nome: "Lanche"},
     {nome: "Café da tarde"},
     {nome: "Café noturno"}
]



const TypeSchemaForm = z.object({
    email: z.email("Usuário inválido"),
    password: z.string().min(5, "A senha deve conter no mínimo 5 caracteres").max(50, "A senha deve conter no máximo 50 caracteres"),
    cnpj: z.string().refine((cnpj) => cnpj.length === 14, {message: "CNPJ inválido"}),
    nomeSocial: z.string(),
    
    item: z.enum(["Desjejum", "Almoço", "Jantar", "Ceia", "Lanche", "Café da tarde", "Café noturno"]),
    subcategory: z.enum(["Granel", "MTX8", "MTX9", "Divisional"]).optional(),
    quantity: z.number(),
})



type TypeForm = z.infer<typeof TypeSchemaForm>





export function DashboardRegister(){

    const {theme} = useTheme()
    const [itemSelected, setItemSelected] = useState<string[]>([])
    const [isActive, setIsActive] = useState(false)
    const {register, handleSubmit, control} = useForm({
        resolver: zodResolver(TypeSchemaForm)
    })



    


    function itemSelect(pressed: string){
       
        setItemSelected(prev => 
            prev.includes(pressed) ? prev.filter(itens => itens !== pressed) :
            [...prev, pressed]
        )

        
    }




    function formHandle(form: TypeForm){

    }




    const isDark = theme === "dark"

    return(
         <div className={`
    min-h-screen transition-colors duration-300
    ${theme === 'dark' 
        ? 'bg-gradient-to-br from-neutral-950 to-neutral-900' 
        : 'bg-gradient-to-br from-neutral-50 to-neutral-100'
    }
    `}>
    {/* Header */}
    <header className={`
        border-b backdrop-blur-sm shadow-sm transition-colors duration-300
        ${theme === 'dark'
        ? 'border-neutral-800 bg-neutral-900/90'
        : 'border-neutral-200 bg-white/90'
        }
    `}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300
            ${theme === 'dark'
                ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-900/30'
                : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200'
            }
            `}>
            <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
            <h1 className={`
                text-2xl font-bold tracking-tight transition-colors duration-300
                ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
            `}>
                Go Eats
            </h1>
            <p className={`
                text-sm transition-colors duration-300
                ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}
            `}>
                Sistema de pedidos de comida
            </p>
            </div>
        </div>
        <Button
            variant="ghost"
            size="sm"
            className={`
            rounded-xl px-4 py-2 transition-all duration-200
            ${theme === 'dark'
                ? 'text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10'
                : 'text-neutral-700 hover:text-orange-600 hover:bg-orange-50'
            }
            `}
        >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
        </Button>
        </div>
    </header>


    {/* FORMULÁRIO */}
    <div className="flex flex-col mt-2">
      <div className="text-3xl font-bold text-center tracking-tight transition-colors duration-300 mt-6 mb-6">
        <h2>Registre novos usuários</h2>
      </div>

      <div className="flex justify-center items-start p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-8">
            <h2 className={`text-2xl font-bold text-center mb-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              Cadastro
            </h2>

            <form onSubmit={handleSubmit(formHandle)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLUNA 1 */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@gmail.com"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("password")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeSocial" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Nome Social
                    </Label>
                    <Input
                      id="NomeSocial"
                      placeholder="Exemple LTDA"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("nomeSocial")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...register("cnpj")}
                    />
                  </div>
                </div>

                {/* COLUNA 2 */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Digite quais itens estão disponíveis ao cliente
                    </Label>

                    {ITENS.map((itens) => (

                   <Button
                        key={itens.nome}
                        
                        className={clsx(
                            "justify-start rounded-xl h-12 transition-all duration-200 m-2 border",
                            {
                            "bg-orange-500 text-white border-orange-500 hover:bg-orange-600":
                                itemSelected.includes(itens.nome) && !isDark,

                            
                            "bg-orange-500 text-white border-orange-400 hover:bg-orange-600":
                                itemSelected.includes(itens.nome) && isDark,

                            
                            "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-orange-600 hover:bg-orange-600/10 hover:text-orange-400":
                                !itemSelected.includes(itens.nome) && isDark,

                            
                            "bg-white border-neutral-200 text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700":
                                !itemSelected.includes(itens.nome) && !isDark,
                            }
                        )}
                        onClick={() => itemSelect(itens.nome)}
                        >
                        {itemSelected.includes(itens.nome) ? (<><Check /> {itens.nome}</>) : (<><Plus className="mr-2" />{itens.nome}</>)}
                        
                    </Button>
                    ))}
                    
                </div>
              </div>
              </div>

              {/* BOTÃO DE SUBMIT */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
















}