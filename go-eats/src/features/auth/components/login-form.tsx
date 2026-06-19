"use client"

import { useRouter } from "next/navigation"
import { Eye, EyeOff, Utensils } from "lucide-react"
import { useTheme } from "../../../shared/contexts/theme-context"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { useUser } from "../contexts/user-context"
import { useLogin } from "../hook/useLogin"
import { useState } from "react"

const LoginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string()
    .max(50, "Máximo 50 caracteres")
    .min(5, "Mínimo 5 caracteres"),
})

export type LoginDataType = z.infer<typeof LoginSchema>







export function LoginForm() {
  const router = useRouter()
  const [showPassword,setShowPassword] = useState<boolean>(false)
  const { user, setUser } = useUser()
  const { theme } = useTheme()
  const { login, loading } = useLogin()
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginDataType>({
    resolver: zodResolver(LoginSchema),
  })

  const isDark = theme === "dark"

  const handleLogin = async (data: LoginDataType) => {
    try {
      await login(data, {
        setError,
        onSuccess: (res) => {
          setUser({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            companyId: res.user.companyId,
          })
          router.replace(res.redirectTo)
        },
      })

      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado")
    }
  }

  const inputClass = `
    h-11 w-full rounded-lg border px-3.5 text-sm
    transition-colors duration-200 placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500
    ${isDark
      ? "bg-neutral-800 border-neutral-700 text-white hover:border-neutral-600"
      : "bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300"
    }
  `








  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      isDark
        ? "bg-neutral-950"
        : "bg-neutral-50"
    }`}>
      <div className="w-full max-w-sm">

        
        <div className={`rounded-xl border p-8 shadow-sm ${
          isDark
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-200"
        }`}>

          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>
              Go Eats
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
              Entre para fazer seu pedido
            </p>
          </div>

          
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">

            <div className="space-y-1.5">
              <label className={`text-xs font-medium uppercase tracking-wide ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}>
                Email
              </label>
              <input
                type="email"
                placeholder="voce@empresa.com"
                {...register("email")}
                className={inputClass}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-medium uppercase tracking-wide ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}>
                Senha
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`${inputClass} pr-10`}
                />
                <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />

                ) : (
                  <Eye className="size-5" />
                )}
              </button>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
              </div>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-2 h-11 w-full rounded-lg
                bg-orange-500 hover:bg-orange-600
                text-white text-sm font-semibold
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2
                active:scale-[0.99]
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>
          </form>
        </div>

        
        <p className={`text-center text-xs mt-6 ${isDark ? "text-neutral-600" : "text-neutral-400"}`}>
          Go Eats © {new Date().getFullYear()}
        </p>

      </div>
    </div>
  )
}