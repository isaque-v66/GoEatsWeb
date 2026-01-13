"use client"

import { createContext, useContext, useState } from "react"
import { TypeForm } from "../components/dashboard-register"

type FormContextType = {
  data: TypeForm | null
  setData: (data: TypeForm) => void
}

const FormContext = createContext<FormContextType | null>(null)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<TypeForm | null>(null)

  return (
    <FormContext.Provider value={{ data, setData }}>
      {children}
    </FormContext.Provider>
  )
}

export function useFormData() {
  const context = useContext(FormContext)
  if (!context) throw new Error("useFormData must be used within FormProvider")
  return context
}
