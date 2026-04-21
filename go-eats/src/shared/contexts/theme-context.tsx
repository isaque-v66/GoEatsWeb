"use client"

import { createContext, useContext, useEffect, useState } from "react"




type Theme = "light" | "dark"


interface ThemeContextProps {
    theme: Theme,
    toggleTheme: ()=> void
}


const ThemeContext = createContext<ThemeContextProps | null>(null)


export function ThemeProvider({children}: {children: React.ReactNode}) {
    const [theme, setTheme] = useState<Theme>("light")

    useEffect(()=>{
        const getLocal = localStorage.getItem("theme") as Theme | null

        if(getLocal){
            setTheme(getLocal)
        }
    }, [])


 
    useEffect(() => {
        const html = document.documentElement

        if(theme === "dark"){
            html.classList.add("dark")
        } else {
            html.classList.remove("dark")
        }

        localStorage.setItem("theme", theme)

    }, [theme])


    function toggleTheme(){
        setTheme(prev => prev === "dark" ? "light" : "dark")
    }



    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )


}



export function useTheme(){
    const context = useContext(ThemeContext)
    if(!context) {
        throw new Error("Theme deve ser passado no provider")
    }


    return context

}