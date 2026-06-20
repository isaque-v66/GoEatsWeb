"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UsersTable } from "../types/table-types"
import { Dispatch, SetStateAction, useEffect } from "react"
import { updateUserTable } from "../services/table.service"
import toast from "react-hot-toast"
import z from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"


type EditUsersDialogProps = {
  openEditDialog: boolean
  setOpenEditDialog: Dispatch<SetStateAction<boolean>>
  selectedUser: UsersTable | null
}


const EditUserSchema = z.object({
  email: z.email("Email inválido").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "USER"]).optional(),
})

type EditUserData = z.infer<typeof EditUserSchema>

export function EditUsersDialog({ openEditDialog, setOpenEditDialog, selectedUser }: EditUsersDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<EditUserData>({
    resolver: zodResolver(EditUserSchema),
  })

 
  useEffect(() => {
    if (selectedUser) {
      reset({
        email: selectedUser.email,
        role: selectedUser.role as "ADMIN" | "USER",
      })
    }
  }, [selectedUser, reset])

  const updateUserMutation = useMutation({
    mutationFn: updateUserTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Usuário atualizado")
      setOpenEditDialog(false)
    },
    onError: () => {
      toast.error("Erro ao atualizar o usuário")
    },
  })

  async function handleUpdate(data: EditUserData) {
    if (!selectedUser) return

    
    const payload: { id: string; email?: string; role?: "ADMIN" | "USER" } = {
      id: selectedUser.id,
    }

    if (dirtyFields.email && data.email) {
      payload.email = data.email
    }

    if (dirtyFields.role && data.role) {
      payload.role = data.role
    }

    if (!payload.email && !payload.role) {
      toast.error("Altere ao menos um campo antes de salvar")
      return
    }

    updateUserMutation.mutate(payload)
  }

  return (
    <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Editar usuário
          </DialogTitle>
          <DialogDescription className="text-sm">
            Altere apenas os campos que deseja atualizar
          </DialogDescription>
        </DialogHeader>

        {selectedUser && (
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">

       
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                Empresa
              </p>
              <p className="text-sm font-medium mt-0.5">
                {selectedUser.company.socialName}
              </p>
            </div>

            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                {...register("email")}
                className="h-9 text-sm"
                placeholder={selectedUser.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

       
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Perfil
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="USER">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenEditDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}