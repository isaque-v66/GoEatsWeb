"use client"

import { useCallback, useState } from "react"

// Cada "pending change" representa uma edição ainda não confirmada de um
// item (quantidade) ou de um pedido inteiro (data). A chave identifica
// unicamente o que está sendo editado.
// LEMBRAR,,,
type PendingQuantityChange = {
  kind: "quantity"
  scheduledOrderId: string
  scheduledOrderItemId: string
  originalQuantity: number
  pendingQuantity: number
}

type PendingDateChange = {
  kind: "date"
  scheduledOrderId: string
  originalDate: string
  pendingDate: string
}

type PendingChange = PendingQuantityChange | PendingDateChange

function quantityKey(scheduledOrderItemId: string) {
  return `qty:${scheduledOrderItemId}`
}

function dateKey(scheduledOrderId: string) {
  return `date:${scheduledOrderId}`
}

export function usePendingOrderChanges() {
  const [pending, setPending] = useState<Record<string, PendingChange>>({})

  const setPendingQuantity = useCallback(
    (scheduledOrderId: string, scheduledOrderItemId: string, originalQuantity: number, newQuantity: number) => {
      const key = quantityKey(scheduledOrderItemId)

      // Se voltou ao valor original, remove a pendência (nada a confirmar)
      if (newQuantity === originalQuantity) {
        setPending(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }

      setPending(prev => ({
        ...prev,
        [key]: {
          kind: "quantity",
          scheduledOrderId,
          scheduledOrderItemId,
          originalQuantity,
          pendingQuantity: newQuantity,
        },
      }))
    },
    []
  )

  const setPendingDate = useCallback(
    (scheduledOrderId: string, originalDate: string, newDate: string) => {
      const key = dateKey(scheduledOrderId)

      if (newDate === originalDate) {
        setPending(prev => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }

      setPending(prev => ({
        ...prev,
        [key]: {
          kind: "date",
          scheduledOrderId,
          originalDate,
          pendingDate: newDate,
        },
      }))
    },
    []
  )

  const discardChange = useCallback((key: string) => {
    setPending(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const discardAllForOrder = useCallback((scheduledOrderId: string) => {
    setPending(prev => {
      const next = { ...prev }
      for (const k of Object.keys(next)) {
        if (next[k].scheduledOrderId === scheduledOrderId) delete next[k]
      }
      return next
    })
  }, [])

  const getQuantityChange = useCallback(
    (scheduledOrderItemId: string) => pending[quantityKey(scheduledOrderItemId)] as PendingQuantityChange | undefined,
    [pending]
  )

  const getDateChange = useCallback(
    (scheduledOrderId: string) => pending[dateKey(scheduledOrderId)] as PendingDateChange | undefined,
    [pending]
  )

  return {
    setPendingQuantity,
    setPendingDate,
    discardChange,
    discardAllForOrder,
    getQuantityChange,
    getDateChange,
    quantityKey,
    dateKey,
  }
}
