"use client"

import { useCallback, useEffect, useState } from "react"
import type { HistoryEntry } from "../types/order-history.types"

export function useOrderHistory(userId?: string, enabled = true) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/history?userId=${userId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Erro ao buscar histórico")
      setEntries(data.entries ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar histórico")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!enabled) return
    fetchHistory()
  }, [enabled, fetchHistory])

  const updateScheduledItem = useCallback(
    async (scheduledOrderId: string, scheduledOrderItemId: string, quantity: number) => {
      if (!userId) return { success: false, message: "Usuário não autenticado" }

      try {
        const res = await fetch(`/api/orders/scheduled/${scheduledOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            itemUpdates: [{ scheduledOrderItemId, quantity }],
          }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, message: data.message ?? "Erro ao atualizar" }

        await fetchHistory()
        return { success: true, message: data.message }
      } catch {
        return { success: false, message: "Erro inesperado ao atualizar" }
      }
    },
    [userId, fetchHistory]
  )

  const moveScheduledOrderDate = useCallback(
    async (scheduledOrderId: string, newDate: string) => {
      if (!userId) return { success: false, message: "Usuário não autenticado" }

      try {
        const res = await fetch(`/api/orders/scheduled/${scheduledOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, newDate }),
        })
        const data = await res.json()
        if (!res.ok) return { success: false, message: data.message ?? "Erro ao mover data" }

        await fetchHistory()
        return { success: true, message: data.message }
      } catch {
        return { success: false, message: "Erro inesperado ao mover data" }
      }
    },
    [userId, fetchHistory]
  )

  return {
    entries,
    loading,
    error,
    refetch: fetchHistory,
    updateScheduledItem,
    moveScheduledOrderDate,
  }
}
