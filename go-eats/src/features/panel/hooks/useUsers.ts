import { useQuery } from "@tanstack/react-query";
import { tableService } from "../services/table.service";




export function useUsers() {
    return useQuery({
        queryKey:["users"],
        queryFn: tableService
    })

}