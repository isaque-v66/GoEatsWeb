"use client"

import { LogOut, Utensils, History, ChevronRight } from "lucide-react"
import { useTheme } from "../contexts/theme-context"
import { Button } from "@/components/ui/button"
import { useUser } from "../../features/auth/contexts/user-context"
import { useRouter, usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const { theme } = useTheme()
  const { user, loading, setUser } = useUser()

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)

  const isDark = theme === "dark"
  const showOrdersButton = pathname?.startsWith("/dashboard")

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
        className={`
          sticky top-0 z-40 w-full
          border-b
          backdrop-blur-xl
          transition-all duration-300
          ${
            isDark
              ? "border-white/5 bg-neutral-950/80"
              : "border-neutral-200/70 bg-white/80"
          }
        `}
      >
        <div className="mx-2 flex h-20 items-center justify-between sm:px-6">

          {/* Logo */}
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="
              group flex min-w-0 items-center gap-3
              rounded-xl
              transition-all duration-200
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-orange-500/40
            "
          >
            <div
              className={`
                relative flex h-10 w-10 shrink-0 items-center justify-center
                overflow-hidden rounded-xl
                bg-gradient-to-br
                shadow-md
                transition-all duration-300
                group-hover:-translate-y-0.5
                group-hover:shadow-lg
                ${
                  isDark
                    ? "from-orange-500 to-orange-700 shadow-orange-900/20"
                    : "from-orange-400 to-orange-600 shadow-orange-500/20"
                }
              `}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <Utensils className="relative z-10 h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 text-left">
              <h1
                className={`
                  truncate text-base font-bold tracking-tight sm:text-lg
                  ${
                    isDark
                      ? "text-white"
                      : "text-neutral-900"
                  }
                `}
              >
                Go Eats
              </h1>

              <p
                className={`
                  hidden truncate text-[11px] leading-tight sm:block
                  ${
                    isDark
                      ? "text-neutral-500"
                      : "text-neutral-500"
                  }
                `}
              >
                Sistema de pedidos
              </p>
            </div>
          </button>

          {/* Ações */}
          <div className="flex items-center gap-2">

            {/* Usuário */}
            {!loading && user && (
              <div
                className={`
                  hidden items-center gap-2.5 rounded-xl border
                  px-3 py-1.5 sm:flex
                  ${
                    isDark
                      ? "border-white/5 bg-white/[0.03]"
                      : "border-neutral-200/80 bg-neutral-50/70"
                  }
                `}
              >
                <div
                  className={`
                    flex h-7 w-7 items-center justify-center
                    rounded-lg text-xs font-bold
                    ${
                      isDark
                        ? "bg-orange-500/15 text-orange-400"
                        : "bg-orange-100 text-orange-600"
                    }
                  `}
                >
                  {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>

                <div className="max-w-[140px]">
                  <p
                    className={`
                      truncate text-xs font-semibold
                      ${
                        isDark
                          ? "text-neutral-200"
                          : "text-neutral-700"
                      }
                    `}
                  >
                    Olá, {user.name}
                  </p>

                  <p
                    className={`
                      text-[10px]
                      ${
                        isDark
                          ? "text-neutral-500"
                          : "text-neutral-400"
                      }
                    `}
                  >
                    Conta ativa
                  </p>
                </div>
              </div>
            )}

            {/* Pedidos */}
            {showOrdersButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/orders")}
                className={`
                  group h-9 rounded-xl px-2.5 sm:px-3
                  transition-all duration-200
                  ${
                    isDark
                      ? "text-neutral-300 hover:bg-orange-500/10 hover:text-orange-400"
                      : "text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
                  }
                `}
              >
                <History
                  className="
                    h-4 w-4
                    transition-transform duration-200
                    group-hover:-rotate-6
                    sm:mr-2
                  "
                />

                <span className="hidden text-xs font-semibold sm:inline">
                  Pedidos
                </span>
              </Button>
            )}

            {/* Separador */}
            <div
              className={`
                hidden h-6 w-px sm:block
                ${isDark ? "bg-white/10" : "bg-neutral-200"}
              `}
            />

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenLogoutDialog(true)}
              className={`
                group h-9 rounded-xl px-2.5 sm:px-3
                transition-all duration-200
                ${
                  isDark
                    ? "text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
                    : "text-neutral-500 hover:bg-red-50 hover:text-red-600"
                }
              `}
            >
              <LogOut
                className="
                  h-4 w-4
                  transition-transform duration-200
                  group-hover:translate-x-0.5
                  sm:mr-2
                "
              />

              <span className="hidden text-xs font-semibold sm:inline">
                Sair
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dialog de logout */}
      <Dialog
        open={openLogoutDialog}
        onOpenChange={setOpenLogoutDialog}
      >
        <DialogContent
          className={`
            overflow-hidden rounded-2xl sm:max-w-md
            ${
              isDark
                ? "border-white/10 bg-neutral-900"
                : "border-neutral-200 bg-white"
            }
          `}
        >
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-xl
                  ${
                    isDark
                      ? "bg-red-500/10 text-red-400"
                      : "bg-red-50 text-red-500"
                  }
                `}
              >
                <LogOut className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle
                  className={
                    isDark ? "text-white" : "text-neutral-900"
                  }
                >
                  Sair da conta
                </DialogTitle>
              </div>
            </div>

            <DialogDescription
              className={
                isDark
                  ? "text-neutral-400"
                  : "text-neutral-500"
              }
            >
              Tem certeza que deseja sair da sua conta? Você
              precisará entrar novamente para fazer pedidos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setOpenLogoutDialog(false)}
              disabled={loadingLogout}
              className="h-10 rounded-xl sm:flex-1"
            >
              Cancelar
            </Button>

            <Button
              onClick={logOut}
              disabled={loadingLogout}
              className="
                h-10 rounded-xl
                bg-gradient-to-r
                from-red-500
                to-red-600
                text-white
                shadow-sm
                transition-all
                hover:-translate-y-[1px]
                hover:from-red-600
                hover:to-red-700
                hover:shadow-md
                sm:flex-1
              "
            >
              {loadingLogout ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saindo...
                </span>
              ) : (
                <>
                  Sair
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
