"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type OrderHistoryContextValue = {
  open: boolean
  openHistory: () => void
  closeHistory: () => void
}

const OrderHistoryContext = createContext<OrderHistoryContextValue | undefined>(undefined)

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <OrderHistoryContext.Provider
      value={{
        open,
        openHistory: () => setOpen(true),
        closeHistory: () => setOpen(false),
      }}
    >
      {children}
    </OrderHistoryContext.Provider>
  )
}


export function useOrderHistory() {
  return useContext(OrderHistoryContext)
}
