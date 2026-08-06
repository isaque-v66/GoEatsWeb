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

export const LoginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string()
    .max(50, "Máximo 50 caracteres")
    .min(5, "Mínimo 5 caracteres"),
})

export type LoginDataType = z.infer<typeof LoginSchema>







export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState<boolean>(false)
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
      h-11
      w-full
      rounded-lg
      border
      px-3.5
      text-sm
      transition-all
      duration-200
      placeholder:text-muted-foreground/70
      focus:outline-none
      focus:ring-2
      focus:ring-orange-500/20
      focus:border-orange-500
      ${
        isDark
          ? "bg-neutral-950/60 border-neutral-700/80 text-white hover:border-neutral-600"
          : "bg-white/80 border-neutral-200 text-neutral-900 hover:border-neutral-300"
      }
    `








  return (
  <div
    className={`relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-neutral-950 via-neutral-950 to-orange-950/20"
        : "bg-gradient-to-br from-orange-50/70 via-white to-neutral-100"
    }`}
  >
    {/* Luz decorativa superior */}
    <div
      className={`pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl ${
        isDark
          ? "bg-orange-600/10"
          : "bg-orange-300/20"
      }`}
    />

    {/* Luz decorativa inferior */}
    <div
      className={`pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl ${
        isDark
          ? "bg-orange-500/5"
          : "bg-orange-200/20"
      }`}
    />

    <div className="relative z-10 w-full max-w-md">
      {/* Card principal */}
      <div
        className={`rounded-2xl border p-7 shadow-xl backdrop-blur-xl transition-all duration-300 sm:p-9 ${
          isDark
            ? "border-white/10 bg-neutral-900/85 shadow-black/30"
            : "border-white/80 bg-white/90 shadow-neutral-200/70"
        }`}
      >
        {/* Logo / Cabeçalho */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-2xl
              bg-gradient-to-br from-orange-400 to-orange-600
              shadow-lg shadow-orange-500/20
            "
          >
            <Utensils className="h-7 w-7 text-white" />
          </div>

          <h1
            className={`mt-4 text-2xl font-semibold tracking-tight ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            Go Eats
          </h1>

          <p
            className={`mt-1.5 text-sm ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            Entre para fazer seu pedido
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label
              className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Email
            </label>

            <input
              type="email"
              placeholder="voce@empresa.com"
              {...register("email")}
              className={inputClass}
            />

            {errors.email && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label
              className={`text-xs font-semibold uppercase tracking-wide ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Senha
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-muted-foreground
                  transition-colors
                  hover:text-orange-500
                "
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-2
              h-11
              w-full
              rounded-lg
              bg-gradient-to-r
              from-orange-500
              to-orange-600
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-orange-500/15
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:from-orange-600
              hover:to-orange-600
              hover:shadow-lg
              hover:shadow-orange-500/20
              focus:outline-none
              focus:ring-2
              focus:ring-orange-500/40
              focus:ring-offset-2
              active:translate-y-0
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>

      {/* Rodapé */}
      <p
        className={`mt-6 text-center text-xs ${
          isDark ? "text-neutral-600" : "text-neutral-400"
        }`}
      >
        Go Eats © {new Date().getFullYear()}
      </p>
    </div>
  </div>
)
}