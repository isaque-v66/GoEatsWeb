"use client"

import { LogOut, Utensils } from "lucide-react"
import { useTheme } from "../contexts/theme-context"
import { Button } from "@/components/ui/button"
import { useUser } from "../../features/auth/contexts/user-context"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function Header() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, loading, setUser } = useUser()
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)

  async function logOut() {
    try {
      setLoadingLogout(true)

      const response = await fetch("/api/logOutUser", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer logout")
      }

      setUser(null)
      router.replace("/login")
    } catch (err) {
      console.error(err)
      toast.error("Erro ao sair da conta")
    } finally {
      setLoadingLogout(false)
      setOpenLogoutDialog(false)
    }
  }

  return (
    <>
      <header
        className={`border-b backdrop-blur-sm shadow-sm transition-colors duration-300 ${
          theme === "dark"
            ? "border-neutral-800 bg-neutral-900/90"
            : "border-neutral-200 bg-white/90"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md sm:h-12 sm:w-12 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-orange-600 to-orange-700"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <Utensils className="h-5 w-5 text-white sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h1
                className={`truncate text-lg font-bold leading-tight sm:text-2xl ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Go Eats
              </h1>
              <p
                className={`truncate text-xs leading-tight sm:text-sm ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Sistema de pedidos de comida
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {!loading && user && (
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Olá, {user.name}
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenLogoutDialog(true)}
              className={`
                relative shrink-0 overflow-hidden group
                px-2 sm:px-3
                transition-colors duration-300
                ${theme === "dark"
                  ? "text-neutral-300 hover:text-orange-400"
                  : "text-neutral-700 hover:text-orange-600"
                }
              `}
            >
             
              <span
                className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                  ${theme === "dark"
                    ? "bg-orange-500/10"
                    : "bg-orange-400/15"
                  }
                `}
              />

              <LogOut
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:mr-2"
              />

              <span className="relative z-10 hidden font-medium sm:inline">
                Sair
              </span>
            </Button>
          </div>
        </div>
      </header>

      
      <Dialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar logout</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair da sua conta?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-1">
            <Button
              variant="outline"
              onClick={() => setOpenLogoutDialog(false)}
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={logOut}
              disabled={loadingLogout}
            >
              {loadingLogout ? "Saindo..." : "Sair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}