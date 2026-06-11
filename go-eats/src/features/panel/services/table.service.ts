import { ApiError } from "../../auth/services/auth.service"



type UserUpdateType = {
    id: string
    email: string
    role: string
}


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



export async function updateUserTable(data: UserUpdateType) {
        const req = await fetch("/api/usersUpdate", {
            method: "PUT",
            headers: {"content-type":"application/json"},
            body: JSON.stringify(data)
        })

        const res = await req.json()


        if(!req.ok) {
            throw new ApiError(
                res.message || "Erro ao atualizar usuários", res.status
            )
        }

        return res


}