"use client"

import { UserCheck, Users, UserX } from "lucide-react"
import { UsersTable } from "../types/table-types"
import { Card } from "@/components/ui/card"



type UsersCardsProps = {
    users: UsersTable[]
}




export function UserCards({users}: UsersCardsProps) {
    const totalUsers = users.length
    const adminUsers = users.filter(user => (
        user.role === "ADMIN"
    ))
    const normalUsers = users.filter(user => (
        user.role === "USER"
    ))




     const stats = [
  {
    label: "Usuários Totais",
    value: totalUsers,
    icon: Users,
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  {
    label: "Administradores",
    value: adminUsers.length,
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Usuários padrão",
    value: normalUsers.length,
    icon: UserX,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
]


    return(
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mt-5">
             {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
        </div>
    )
}