"use client"

import { useEffect, useState } from "react"

export function useOccupiedDates(userId?: string, enabled = true) {
  const [occupiedDates, setOccupiedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId || !enabled) return

    setLoading(true)
    fetch(`/api/scheduledOrders/dates?userId=${userId}`)
      .then(res => res.json())
      .then(data => setOccupiedDates(data.occupiedDates ?? []))
      .catch(err => console.error("Erro ao buscar datas ocupadas:", err))
      .finally(() => setLoading(false))
  }, [userId, enabled])

  return { occupiedDates, loading }
}