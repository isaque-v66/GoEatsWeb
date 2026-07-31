import { handleApiError } from "@/src/shared/errors/ApiError"
import { Order } from "../types/order.types"

interface SubmitOrderDTO {
  userId: string
  companyId: string
  orders: Order
}

export async function createOrder(
  data: SubmitOrderDTO
) {
  const res = await fetch("/api/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    await handleApiError(res)
  }

  return res.json()
}







export async function sendOrder(
  orderId: string
) {
  const res = await fetch("/api/sendOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  })

  if (!res.ok) {
    await handleApiError(res)
  }

  return res.json()
}