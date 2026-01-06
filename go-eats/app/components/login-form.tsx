"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Utensils } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
  <div className="w-full max-w-md">
    <div className="rounded-2xl bg-white p-8 shadow-xl shadow-neutral-200/50">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200">
          <Utensils className="h-9 w-9 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Go Eats
          </h1>
          <p className="text-neutral-500 text-base">
            Entre e faça seu pedido
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-800">
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              h-12 w-full rounded-xl border border-neutral-200 bg-white px-4
              text-neutral-900 placeholder-neutral-400
              transition-all duration-200
              focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20
              focus:outline-none focus:shadow-sm
              hover:border-neutral-300
            "
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-800">
            Senha
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              h-12 w-full rounded-xl border border-neutral-200 bg-white px-4
              text-neutral-900 placeholder-neutral-400
              transition-all duration-200
              focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20
              focus:outline-none focus:shadow-sm
              hover:border-neutral-300
            "
          />
        </div>

        <button
          type="submit"
          className="
            h-12 w-full rounded-xl
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white font-semibold text-base
            transition-all duration-300
            hover:from-orange-600 hover:to-orange-700
            hover:shadow-lg hover:shadow-orange-200
            active:scale-[0.99] active:shadow-md
            focus:outline-none focus:ring-3 focus:ring-orange-500/40
          "
        >
          Entrar
        </button>
      </form>

      {/* Optional: Sign up link */}
      <div className="mt-8 text-center">
        <p className="text-neutral-500 text-sm">
          Não tem uma conta?{" "}
          <a href="#" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
  )
}
