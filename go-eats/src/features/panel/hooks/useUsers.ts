import { useQuery } from "@tanstack/react-query"
import { tableService } from "../services/table.service"

type UseUsersParams = {
  page: number
  pageSize?: number
  search?: string
  status?: "ALL" | "ADMIN" | "USER"
}

export function useUsers({ page, pageSize = 10, search = "", status = "ALL" }: UseUsersParams) {
  return useQuery({
    queryKey: ["users", page, pageSize, search, status],
    queryFn: () => tableService({ page, pageSize, search, status }),
    placeholderData: previousData => previousData, 
  })
}