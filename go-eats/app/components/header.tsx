import { LogOut, Utensils } from "lucide-react"
import { useTheme } from "../contexts/theme-context"
import { Button } from "@/components/ui/button"



export function Header() {

    const {theme} = useTheme()


    return(
         <div className={`
             transition-colors duration-300
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-neutral-950 to-neutral-900' 
              : 'bg-gradient-to-br from-neutral-50 to-neutral-100'
            }
          `}>
            {/* Header */}
            <header className={`
              border-b backdrop-blur-sm shadow-sm transition-colors duration-300
              ${theme === 'dark'
                ? 'border-neutral-800 bg-neutral-900/90'
                : 'border-neutral-200 bg-white/90'
              }
            `}>
              <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-300
                    ${theme === 'dark'
                      ? 'bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-900/30'
                      : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-200'
                    }
                  `}>
                    <Utensils className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className={`
                      text-2xl font-bold tracking-tight transition-colors duration-300
                      ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}
                    `}>
                      Go Eats
                    </h1>
                    <p className={`
                      text-sm transition-colors duration-300
                      ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}
                    `}>
                      Sistema de pedidos de comida
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    rounded-xl px-4 py-2 transition-all duration-200
                    ${theme === 'dark'
                      ? 'text-neutral-300 hover:text-orange-500 hover:bg-orange-500/10'
                      : 'text-neutral-700 hover:text-orange-600 hover:bg-orange-50'
                    }
                  `}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </header>
            </div>
    )
}