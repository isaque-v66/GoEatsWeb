"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, LogOut, Coffee, Sandwich, Pizza, Cookie, Plus, ShoppingCart } from "lucide-react"
import { OrderSummary } from "./order-summary"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useTheme } from "../contexts/theme-context"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"


//Dados itens
interface TypeItems {
    item: string,
    subcategory?: string,
    quantity: number,
    
}


//Dados formulário
const TypeSchemaForm = z.object({
    email: z.email("Usuário inválido"),
    password: z.string().min(5, "A senha deve conter no mínimo 5 caracteres").max(50, "A senha deve conter no máximo 50 caracteres"),
    cnpj: z.string().refine((cnpj) => cnpj.length === 14, {message: "CNPJ inválido"}),
    nomeSocial: z.string()
})



type TypeForm = z.infer<typeof TypeSchemaForm>





export function DashboardRegister(){

    const {theme} = useTheme()
    const {register, handleSubmit} = useForm({
        resolver: zodResolver(TypeSchemaForm)
    })




    function formHandle(form: TypeForm){

    }




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


    <div className="flex flex-col mt-2">
        <div className="text-3xl font-bold text-3xl font-bold text-center tracking-tight transition-colors duration-300 mt-6 ml-4 mb-6 ">
            <h2>Registre novos usuários</h2>
        </div>


     <div className="flex justify-center items-center min-h-screen p-4">
    <Card className="w-full max-w-md shadow-lg ml-8">
        <CardContent className="p-8">
            <h2 className={`text-2xl font-bold text-center mb-8  ${theme === "dark" ? "text-white": "text-gray-800"}`}>
                Cadastro
            </h2>
            
            <form onSubmit={handleSubmit(formHandle)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className={`text-sm font-medium  ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
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
                    <Label htmlFor="password" className={`text-sm font-medium  ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
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
                    <Label htmlFor="nomeSocial" className={`text-sm font-medium  ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        Nome Social
                    </Label>
                    <Input
                        id="NomeSocial"
                        placeholder="Exemple LDTA"
                        className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register("nomeSocial")}
                    />
                    
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cnpj" className={`text-sm font-medium  ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        CNPJ
                    </Label>
                    <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        className="w-full h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register("cnpj")}
                    />
                   
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium mt-4"
                >
                    Cadastrar
                </Button>
            </form>
        </CardContent>
    </Card>
</div>


    </div>




















    </div>
    )





}