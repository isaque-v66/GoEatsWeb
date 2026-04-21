"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "../contexts/theme-context"





export function ToggleTheme(){

    const {theme, toggleTheme} = useTheme()


    return(
         <button
            onClick={toggleTheme}
            className="
                fixed bottom-6 right-6 z-50
                rounded-full border border-neutral-300 bg-white/90 backdrop-blur-sm
                p-3 shadow-xl shadow-black/5 transition-all duration-300
                hover:scale-110 hover:bg-white hover:shadow-2xl hover:shadow-black/10
                dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800
            "
            aria-label="Alternar tema"
            >
            {theme === "dark" ? (
                <Sun className="h-6 w-6 text-orange-400" />
            ) : (
                <Moon className="h-6 w-6 text-orange-500" />
            )}
            </button>
    )
}