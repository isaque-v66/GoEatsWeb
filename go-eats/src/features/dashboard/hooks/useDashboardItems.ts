import { useEffect, useState } from "react"
import { getDashboardItems } from "../services/dashboard.service"
import { AvailableItem } from "../constants/itemValues.constants"





export function useDashboardItems(userId?: string) {

  const [items, setItems] = useState<AvailableItem[]>([])
  const [loading, setLoading] = useState(true)







  useEffect(() => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
       if (!userId) return

        try {
            setLoading(true)

            const data = await getDashboardItems(userId) 

            if (!cancelled) setItems(data)
        } finally {
            setLoading(false)
        }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [userId])

  return { items, loading }
}