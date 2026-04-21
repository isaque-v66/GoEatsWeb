"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { TypeForm } from "../components/dashboard-register"

type FormContextType = {
  data: TypeForm | null
  setData: (data: TypeForm) => void
  clearData: () => void
}

const FormContext = createContext<FormContextType | null>(null)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<TypeForm | null>(null)


  useEffect(()=> {
    const stored = localStorage.getItem("register-data")
    if(stored) {
        setDataState(JSON.parse(stored))
    }

  }, [])

  

  function setData(data: TypeForm) {
    setDataState(data)
    localStorage.setItem("register-data", JSON.stringify(data))
  }



  function clearData() {
    setDataState(null)
    localStorage.removeItem("register-data")
  }



  return (
    <FormContext.Provider value={{ data, setData, clearData }}>
      {children}
    </FormContext.Provider>
  )
}

export function useFormData() {
  const context = useContext(FormContext)
  if (!context) throw new Error("useFormData must be used within FormProvider")
  return context
}
