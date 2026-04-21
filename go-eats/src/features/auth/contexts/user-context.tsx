"use client"

import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react"

type User = {
  id: string
  name: string
  email: string
}

type UserContextType = {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
  loading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me")
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used inside UserProvider")
  }
  return context
}
