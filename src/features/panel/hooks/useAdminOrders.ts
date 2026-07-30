"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type AdminOrderItem = {
  itemName: string
  subcategoryName: string | null
  quantity: number
}

export type MealEntry = {
  mealType: string
  items: AdminOrderItem[]
}

export type SourceRef = {
  id: string
  kind: "normal" | "scheduled"
}

export type UserDayRow = {
  userId: string
  date: string
  companyName: string
  cnpj: string
  meals: MealEntry[]
  sources: SourceRef[]
  reviewedAt: string | null
  hasProjection: boolean
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type AdminOrdersResponse = {
  rows: UserDayRow[]
  daysWithOrders: string[]
  pagination: Pagination
}

export const MEAL_LABELS: Record<string, string> = {
  DESJEJUM: "Desjejum",
  ALMOCO: "Almoço",
  CAFE_TARDE: "Café da Tarde",
  JANTAR: "Jantar",
  CEIA: "Ceia",
  LANCHE: "Lanche",
  BEBIDAS: "Bebidas",
  CAFE_NOTURNO: "Café Noturno",
  ESPECIAL: "Especial",
}

async function fetchAdminOrders(month: string, day: string | undefined, page: number, pageSize: number): Promise<AdminOrdersResponse> {
  const params = new URLSearchParams({ month, page: String(page), pageSize: String(pageSize) })
  if (day) params.set("day", day)
  const res = await fetch(`/api/admin/orders?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar pedidos")
  return res.json()
}

async function markReviewed(payload: { sources: SourceRef[]; reviewed: boolean }) {
  const res = await fetch("/api/admin/orders/review", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Erro ao marcar revisão")
  return res.json()
}

export function useAdminOrders(month: string, day: string | undefined, page: number, pageSize = 15) {
  return useQuery({
    queryKey: ["admin-orders", month, day ?? "all", page, pageSize],
    queryFn: () => fetchAdminOrders(month, day, page, pageSize),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 20_000,
    placeholderData: prev => prev,
  })
}

export function useReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markReviewed,
    onMutate: async ({ sources, reviewed }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] })
      const snapshot = queryClient.getQueriesData({ queryKey: ["admin-orders"] })

      const sourceIds = new Set(sources.map(s => `${s.kind}::${s.id}`))

      queryClient.setQueriesData(
        { queryKey: ["admin-orders"] },
        (old: AdminOrdersResponse | undefined) => {
          if (!old) return old
          const now = new Date().toISOString()
          return {
            ...old,
            rows: old.rows.map(row => {
              const matches = row.sources.some(s => sourceIds.has(`${s.kind}::${s.id}`))
              if (!matches) return row
              return { ...row, reviewedAt: reviewed ? now : null }
            }),
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