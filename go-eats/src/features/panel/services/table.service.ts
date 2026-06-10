import { ApiError } from "../../auth/services/auth.service"





export async function tableService() {
        
        const response = await fetch("/api/users")

        const data = await response.json()

        if(!response.ok) {
            throw new ApiError(
                data.message || "Erro ao buscar usuários", response.status
            )
        }

        return data

    
}