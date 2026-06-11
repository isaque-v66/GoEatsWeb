"use client"

import { useEffect, useState } from "react"
import { deleteUserTable, tableService } from "../services/table.service"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UsersTable } from "../types/table-types"
import { EditUsersDialog } from "./edit-users-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { DeleteUsersDialog } from "./delete-users-dialog"



type TableProps = {
  users: UsersTable[]
}





export function Table({users}: TableProps) {
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UsersTable | null>(null)
 
  



  
    return (
        <div className="overflow-hidden rounded-lg border border-border mt-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Companhia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    CNPJ da Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pedidos Padrão
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Configurações
                  </th>
                </tr>
              </thead>
              


              {/*CORPO*/}
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-card transition-colors hover:bg-secondary/50">

                  <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-secondary text-xs text-foreground">
                            {user.company.socialName}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          
                        </div>
                      </div>
                    </td>


                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {user.email}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {user.company.socialName}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {user.role}
                      </span>
                    </td>


                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {user.company.cnpj}
                      </span>
                    </td>


                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
                      >
                        {user.itemConfigs.map(config => config.item.name).join(", ")}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setOpenEditDialog(true),
                            setSelectedUser(user)
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar usuário
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setOpenDeleteDialog(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>



                    </tr>
                ))}

              </tbody>
        
            </table>
          </div>
          <EditUsersDialog 
            openEditDialog = {openEditDialog}
            setOpenEditDialog = {setOpenEditDialog}
            selectedUser = {selectedUser}
            />

          <DeleteUsersDialog
            userId={selectedUserId ?? ""}
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
          />
     
    </div>
    )
}