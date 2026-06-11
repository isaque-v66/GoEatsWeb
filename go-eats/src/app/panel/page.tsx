"use client"

import { Button } from "@/components/ui/button";
import { Table } from "@/src/features/panel/components/table";
import { UserCards } from "@/src/features/panel/components/user-cards";
import { useUsers } from "@/src/features/panel/hooks/useUsers";
import { Header } from "@/src/shared/components/header";
import { useTheme } from "@/src/shared/contexts/theme-context";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";




export default function Panel() {
    const {theme} = useTheme()
    const router = useRouter()
    const {data: users = [], isLoading} = useUsers()
  
  

    return (
        <div>
            <Header />
            <div className="min-h-screen p-6">
                <UserCards users={users}/>
                <div className="flex flex-col mt-4">
                     <Button 
                        className={`self-end ${
                            theme === "dark"
                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                        onClick={() => router.replace("/dashboardRegister")}
                    >
                        <Plus /> Adicionar usuário
                    </Button>
                    <Table users={users}/>
                </div>
            </div>
        </div>
    )
}