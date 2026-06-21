"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Trash2, Building2, Mail, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UsersTable } from "../types/table-types"
import { EditUsersDialog } from "./edit-users-dialog"
import { DeleteUsersDialog } from "./delete-users-dialog"

type TableProps = {
  users: UsersTable[]
}

export function Table({ users }: TableProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersTable | null>(null)

  return (
    <>
      
      <div className="hidden md:block overflow-hidden rounded-lg border border-border mt-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Usuário", "Email", "Companhia", "Status", "CNPJ", "Itens", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground ${i === 6 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="bg-card transition-colors hover:bg-muted/30">

                 
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border shrink-0">
                        <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                          {user.company.socialName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {user.company.socialName}
                      </span>
                    </div>
                  </td>

                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {user.email}
                  </td>

                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {user.company.socialName}
                  </td>

                  
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className="text-xs font-medium"
                    >
                      {user.role === "ADMIN" ? "Admin" : "Usuário"}
                    </Badge>
                  </td>

                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground font-mono">
                    {user.company.cnpj}
                  </td>

                 
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {user.itemConfigs.length > 0
                        ? user.itemConfigs.slice(0, 3).map(config => (
                            <Badge key={config.item.name} variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                              {config.item.name}
                            </Badge>
                          ))
                        : <span className="text-xs text-muted-foreground">—</span>
                      }
                      {user.itemConfigs.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                          +{user.itemConfigs.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>

                  
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setOpenEditDialog(true); setSelectedUser(user) }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar usuário
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => { setSelectedUserId(user.id); setOpenDeleteDialog(true) }}
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
      </div>

      {/*lista de cards */}
      <div className="md:hidden mt-4 space-y-3">
        {users.map(user => (
          <div
            key={user.id}
            className="rounded-lg border border-border bg-card p-4 space-y-3"
          >
         
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 border border-border shrink-0">
                  <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                    {user.company.socialName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.company.socialName}
                  </p>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className="text-[10px] mt-0.5"
                  >
                    {user.role === "ADMIN" ? "Admin" : "Usuário"}
                  </Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setOpenEditDialog(true); setSelectedUser(user) }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar usuário
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { setSelectedUserId(user.id); setOpenDeleteDialog(true) }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar usuário
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Detalhes */}
            <div className="space-y-1.5 border-t border-border pt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono">{user.company.cnpj}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{user.company.socialName}</span>
              </div>
            </div>

            {/* Itens */}
            {user.itemConfigs.length > 0 && (
              <div className="flex flex-wrap gap-1 border-t border-border pt-3">
                {user.itemConfigs.map(config => (
                  <Badge key={config.item.name} variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                    {config.item.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <EditUsersDialog
        openEditDialog={openEditDialog}
        setOpenEditDialog={setOpenEditDialog}
        selectedUser={selectedUser}
      />
      <DeleteUsersDialog
        userId={selectedUserId ?? ""}
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
      />
    </>
  )
}