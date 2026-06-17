"use client"

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table } from "@/src/features/panel/components/table";
import { UserCards } from "@/src/features/panel/components/user-cards";
import { useDebouncedValue } from "@/src/features/panel/hooks/useDebouncedValue";
import { useUsers } from "@/src/features/panel/hooks/useUsers";
import { Header } from "@/src/shared/components/header";
import { useTheme } from "@/src/shared/contexts/theme-context";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";




export default function Panel() {
    const {theme} = useTheme()
    const isDark = theme === "dark"
    const router = useRouter()
    
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [status, setStatus] = useState<"ALL" | "ADMIN" | "USER">("ALL")

    const search = useDebouncedValue(searchInput, 400)
    
    const {data, isLoading, isFetching} = useUsers({page, search, status})

    const users = data?.users ?? []
    const pagination = data?.pagination




    function handleSearchChange(value: string) {
        setSearchInput(value)
        setPage(1)
    }


     function handleStatusChange(value: "ALL" | "ADMIN" | "USER") {
        setStatus(value)
        setPage(1)
    }


    
  
  

    return (
      <div>
      <Header />
      <div className="min-h-screen p-6">
        <UserCards users={users} />

        <div className="flex flex-col mt-4 space-y-4">
          <Button
            className={`self-end ${
              isDark
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
            onClick={() => router.replace("/dashboardRegister")}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar usuário
          </Button>

          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Buscar por usuário, email, empresa ou CNPJ"
                className="
                  w-full pl-10 pr-3 h-10 text-sm
                  border rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500
                "
              />
            </div>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-44 h-10 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os status</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="USER">Usuários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
          <div className="relative">
            {isFetching && !isLoading && (
              <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                Atualizando...
              </div>
            )}

            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Carregando usuários...
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            ) : (
              <Table users={users} />
            )}
          </div>

         
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} usuário(s)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    )
}