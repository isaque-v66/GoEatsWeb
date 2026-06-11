"use client"

import { Button } from "@/components/ui/button";
import { Table } from "@/src/features/panel/components/table";
import { UserCards } from "@/src/features/panel/components/user-cards";
import { tableService } from "@/src/features/panel/services/table.service";
import { UsersTable } from "@/src/features/panel/types/table-types";
import { Header } from "@/src/shared/components/header";
import { useTheme } from "@/src/shared/contexts/theme-context";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function Panel() {

    const [users, setUsers] = useState<UsersTable[]>([])
    const {theme} = useTheme()
    const router = useRouter()
  
  useEffect(() => {
    tableService().then((allUsers: UsersTable[]) => setUsers(allUsers))
  }, [])

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