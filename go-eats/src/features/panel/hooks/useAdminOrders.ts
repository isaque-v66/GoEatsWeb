"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"

export type AdminOrderItem = {
  itemName: string
  subcategoryName: string | null
  quantity: number
}

export type AdminOrderEntry = {
  id: string
  kind: "normal" | "scheduled"
  date: string
  mealType?: string
  companyName: string
  cnpj: string
  reviewedAt: string | null
  items: AdminOrderItem[]
}

export type AdminOrdersResponse = {
  orders: AdminOrderEntry[]
  scheduledOrders: AdminOrderEntry[]
  daysWithOrders: string[]
}

const MEAL_LABELS: Record<string, string> = {
  DESJEJUM: "Desjejum",
  ALMOCO: "Almoço",
  CAFE_TARDE: "Café da Tarde",
  JANTAR: "Jantar",
  CEIA: "Ceia",
  LANCHE: "Lanche",
  BEBIDAS: "Bebidas",
  CAFE_NOTURNO: "Café Noturno",
}

export { MEAL_LABELS }

async function fetchAdminOrders(month: string, day?: string): Promise<AdminOrdersResponse> {
  const params = new URLSearchParams({ month })
  if (day) params.set("day", day)
  const res = await fetch(`/api/admin/orders?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar pedidos")
  return res.json()
}

async function markReviewed(payload: { id: string; kind: "normal" | "scheduled"; reviewed: boolean }) {
  const res = await fetch("/api/admin/orders/review", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Erro ao marcar revisão")
  return res.json()
}

export function useAdminOrders(month: string, day?: string) {
  return useQuery({
    queryKey: ["admin-orders", month, day ?? "all"],
    queryFn: () => fetchAdminOrders(month, day),
    // Polling de 30s: novos pedidos aparecem automaticamente sem recarregar
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  })
}

export function useReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markReviewed,
    // Optimistic update: o checkbox responde imediatamente sem esperar o servidor
    onMutate: async ({ id, kind, reviewed }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] })

      const snapshot = queryClient.getQueriesData({ queryKey: ["admin-orders"] })

      queryClient.setQueriesData(
        { queryKey: ["admin-orders"] },
        (old: AdminOrdersResponse | undefined) => {
          if (!old) return old
          const now = new Date().toISOString()
          const update = (entries: AdminOrderEntry[]) =>
            entries.map(e =>
              e.id === id && e.kind === kind
                ? { ...e, reviewedAt: reviewed ? now : null }
                : e
            )
          return {
            ...old,
            orders: update(old.orders),
            scheduledOrders: update(old.scheduledOrders),
          }
        }
      )

      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        for (const [key, data] of ctx.snapshot) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
  })
}
