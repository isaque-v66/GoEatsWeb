"use client"

import { useCallback, useEffect, useState } from "react"
import type { HistoryEntry } from "../types/order-history.types"

type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function useOrderHistory(userId?: string, page = 1, pageSize = 15, enabled = true) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        userId,
        page: String(page),
        pageSize: String(pageSize),
      })
      const res = await fetch(`/api/orders/history?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Erro ao buscar histórico")
      setEntries(data.entries ?? [])
      setPagination(data.pagination ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar histórico")
    } finally {
      setLoading(false)
    }
  }, [userId, page, pageSize])

  useEffect(() => {
    if (!enabled) return
    fetchHistory()
  }, [fetchHistory, enabled])

  const updateScheduledItem = useCallback(
    async (scheduledOrderId: string, scheduledOrderItemId: string, quantity: number) => {
      if (!userId) return { success: false, message: "Usuário não autenticado" }
      try {
        const res = await fetch(`/api/orders/scheduled/${scheduledOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, itemUpdates: [{ scheduledOrderItemId, quantity }] }),
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
    pagination,
    loading,
    error,
    refetch: fetchHistory,
    updateScheduledItem,
    moveScheduledOrderDate,
  }
}
