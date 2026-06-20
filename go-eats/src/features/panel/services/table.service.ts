import { ApiError } from "../../auth/services/auth.service"

type UserUpdateType = {
  id: string
  email?: string
  role?: string
}

type FetchUsersParams = {
  page?: number
  pageSize?: number
  search?: string
  status?: "ALL" | "ADMIN" | "USER"
}








export async function tableService({page = 1, pageSize = 10, search = "", status = "ALL"}: FetchUsersParams = {}) {
  
  
    const params = new URLSearchParams({page: String(page), pageSize: String(pageSize)})

    if (search) params.set("search", search)
    if (status !== "ALL") params.set("status", status)

    const response = await fetch(`/api/users?${params.toString()}`)
    const data = await response.json()

    if (!response.ok) {
        throw new ApiError(data.message || "Erro ao buscar usuários", response.status)
    }

    return data
    }

    export async function updateUserTable(data: UserUpdateType) {
    const req = await fetch("/api/usersUpdate", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
    })

    const res = await req.json()

    if (!req.ok) {
        throw new ApiError(res.message || "Erro ao atualizar usuários", res.status)
    }

    return res
}









export async function deleteUserTable(id: string) {

    const response = await fetch(`/api/usersDelete/${id}`, { method: "DELETE" })
    const data = await response.json()

    if (!response.ok) {
        throw new ApiError(data.message || "Erro ao atualizar usuários", data.status)
    }

    return data
}