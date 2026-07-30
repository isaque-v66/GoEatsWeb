import { handleApiError } from "@/src/shared/errors/ApiError"

export async function getDashboardItems(
  userId: string
) {
  const res = await fetch(
    `/api/dashboard/items?userId=${userId}`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    await handleApiError(res)
  }

  const data = await res.json()

  return data.items || []
}