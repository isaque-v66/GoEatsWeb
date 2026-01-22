"use client"

import { LogOut, Utensils } from "lucide-react"
import { useTheme } from "../contexts/theme-context"
import { Button } from "@/components/ui/button"
import { useUser } from "../contexts/user-context"
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                theme === "dark"
                  ? "bg-gradient-to-br from-orange-600 to-orange-700"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Go Eats
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                Sistema de pedidos de comida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!loading && user && (
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Olá, {user.name}
              </span>
            )}

            <Button
            variant="ghost"
            size="sm"
            onClick={()=> setOpenLogoutDialog(true)}
            className={`
              relative overflow-hidden group
              transition-colors duration-300
              ${theme === "dark"
                ? "text-neutral-300 hover:text-orange-400"
                : "text-neutral-700 hover:text-orange-600"
              }
            `}
          >
            {/* Glow */}
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
              className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-1"
            />

            <span className="relative z-10 font-medium">
              Sair
            </span>
          </Button>

          </div>
        </div>
      </header>

      {/* MODAL DE CONFIRMAÇÃO */}
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
