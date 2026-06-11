"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dispatch, SetStateAction, useState } from "react"
import { deleteUserTable } from "../services/table.service"
import toast from "react-hot-toast"


type DeleteType = {
    userId: string,
    setOpenDeleteDialog: Dispatch<SetStateAction<boolean>>
    openDeleteDialog: boolean
}


export function DeleteUsersDialog({userId, setOpenDeleteDialog, openDeleteDialog}: DeleteType) {

   const queryClient = useQueryClient()
    

    
   const deleteUserMutation = useMutation({
        mutationFn: deleteUserTable,

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
            toast.success("Usuário deletado com sucesso")
            setOpenDeleteDialog(false)
        },

        onError: () => {
            toast.error('Erro ao Deletar o usuário')
        }
    })

    return(
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Delete</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esse usuário?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-1">
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => deleteUserMutation.mutate(userId)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        
    )
}