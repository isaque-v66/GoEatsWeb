"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Utensils } from "lucide-react"
import { useTheme } from "../contexts/theme-context"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const {theme, toggleTheme} = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
 <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br  px-4   ${theme === 'dark' 
        ? 'bg-gradient-to-br from-neutral-950 to-neutral-900' 
        : 'bg-gradient-to-br from-neutral-50 to-neutral-100'
      }`} >
  <div className="w-full max-w-md">
    <div className={`
          rounded-2xl p-8 shadow-xl transition-all duration-300
          ${theme === 'dark' 
            ? 'bg-neutral-900 shadow-black/40 border border-neutral-800' 
            : 'bg-white shadow-neutral-200/50 border border-neutral-100'
          }
        `}>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className={`${theme === 'dark'
                ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-900/30'
                : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200'
              } mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br `}>
          <Utensils className="h-9 w-9 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
            Go Eats
          </h1>
          <p className={` text-base ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Entre e faça seu pedido
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className={` text-sm font-medium transition-colors duration-300
                ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-800'}`}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`
                  h-12 w-full rounded-xl border px-4
                  transition-all duration-300
                  placeholder-neutral-400
                  focus:ring-3 focus:outline-none focus:shadow-sm
                  hover:border-neutral-300
                  ${theme === 'dark'
                    ? 'bg-neutral-800 border-neutral-700 text-white ' +
                      'focus:border-orange-500 focus:ring-orange-500/20 ' +
                      'hover:border-neutral-600'
                    : 'bg-white border-neutral-200 text-neutral-900 ' +
                      'focus:border-orange-500 focus:ring-orange-500/20 ' +
                      'hover:border-neutral-300'
                  }
                `}
          />
        </div>

        <div className="space-y-1.5">
          <label className={` text-sm font-medium transition-colors duration-300
                ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-800'}`}>
            Senha
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`
                  h-12 w-full rounded-xl border px-4
                  transition-all duration-300
                  placeholder-neutral-400
                  focus:ring-3 focus:outline-none focus:shadow-sm
                  hover:border-neutral-300
                  ${theme === 'dark'
                    ? 'bg-neutral-800 border-neutral-700 text-white ' +
                      'focus:border-orange-500 focus:ring-orange-500/20 ' +
                      'hover:border-neutral-600'
                    : 'bg-white border-neutral-200 text-neutral-900 ' +
                      'focus:border-orange-500 focus:ring-orange-500/20 ' +
                      'hover:border-neutral-300'
                  }
                `}
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


    </div>
  </div>
</div>
  )
}
