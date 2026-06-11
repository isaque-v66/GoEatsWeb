"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UsersTable } from "../types/table-types"
import { Dispatch, SetStateAction, useEffect } from "react"
import { useTheme } from "@/src/shared/contexts/theme-context"
import { deleteUserTable, updateUserTable } from "../services/table.service"
import toast from "react-hot-toast"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"


type EditUsersDialogProps = {
  openEditDialog: boolean
  setOpenEditDialog: Dispatch<SetStateAction<boolean>>
  selectedUser: UsersTable | null
}


const EditUserSchema = z.object({
    email: z.email("Email inválido"),
    role: z.enum(["ADMIN", "USER"])
})


type EditUserData = z.infer<typeof EditUserSchema>


export function EditUsersDialog({openEditDialog, setOpenEditDialog, selectedUser}: EditUsersDialogProps) {
    const {theme} = useTheme()
    const queryClient = useQueryClient()
    const {register, handleSubmit, formState: { errors},} = useForm<EditUserData>({
        resolver: zodResolver(EditUserSchema),
    })



    const updateUserMutation = useMutation({
        mutationFn: updateUserTable,

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
            toast.success("Usuário atualizado")
            setOpenEditDialog(false)
        },

        onError: () => {
            toast.error('Erro ao atualizar o usuário')
        }

    })






    async function handleUpdate(data: EditUserData) {
        if (!selectedUser) return

        updateUserMutation.mutate({
            id: selectedUser.id,
            email: data.email,
            role: data.role
        })
      
    }


    return(
        <Dialog
            open={openEditDialog}
            onOpenChange={setOpenEditDialog}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualize as informações do usuário.
                </DialogDescription>
              </DialogHeader>

              {selectedUser && (
                <form
                    onSubmit={handleSubmit(handleUpdate)}
                    className="space-y-4"
                    >

                  <div>
                   <input
                        {...register("email")}
                        className="w-full rounded-md border p-2"
                    />

                    {errors.email && (
                        <p className="text-sm text-red-500">
                        {errors.email.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                        Perfil
                    </label>

                    <select
                        {...register("role")}
                        className={`w-full rounded-md border p-2 ${
                        theme === "dark"
                            ? "bg-neutral-800 text-white"
                            : "bg-white text-black"
                        }`}
                    >
                        <option value="ADMIN">
                        ADMIN
                        </option>

                        <option value="USER">
                        USER
                        </option>
                    </select>

                    {errors.role && (
                        <p className="text-sm text-red-500">
                        {errors.role.message}
                        </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Empresa
                    </label>

                    <input
                      defaultValue={selectedUser.company.socialName}
                      className="w-full rounded-md border p-2 bg-muted"
                      />
                  </div>
                    <DialogFooter>
                        <Button
                        variant="outline"
                        onClick={() => setOpenEditDialog(false)}
                        >
                        Cancelar
                        </Button>

                        <Button type="submit" disabled={updateUserMutation.isPending}>
                         {updateUserMutation.isPending
                            ? "Salvando..."
                            : "Salvar"}
                        </Button>

                    </DialogFooter>
                  </form>
              )}
            </DialogContent>
          </Dialog>
    )
}