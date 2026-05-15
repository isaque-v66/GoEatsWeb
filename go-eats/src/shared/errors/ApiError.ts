import { AppError } from "./AppError"

export async function handleApiError(
  response: Response
) {
  const data = await response.json()

  throw new AppError(
    data.message || "Erro inesperado",
    response.status
  )
}