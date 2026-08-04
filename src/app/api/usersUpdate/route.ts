import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { MealType } from "@prisma/client"

type SubcategoryPayload = {
  name: string
  weekdayQuantity?: number | null
  saturdayQuantity?: number | null
  sundayQuantity?: number | null
}

type ItemPayload = {
  name: string
  mealType: MealType
  weekdayQuantity?: number | null
  saturdayQuantity?: number | null
  sundayQuantity?: number | null
  subcategories?: SubcategoryPayload[]
}

type UpdatePayload = {
  id: string
  email?: string
  password?: string
  role?: "ADMIN" | "USER"
  company?: string
  cnpj?: string
  items?: ItemPayload[]
}

export async function PUT(req: Request) {
  try {
    const body: UpdatePayload = await req.json()
    const { id, email, password, role, company, cnpj, items } = body

    if (!id) {
      return NextResponse.json({ message: "ID do usuário não informado" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { companyId: true },
    })

    if (!existingUser) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    if (email) {
      const emailInUse = await prisma.user.findFirst({ where: { email, NOT: { id } } })
      if (emailInUse) {
        return NextResponse.json({ message: "Este email já está em uso" }, { status: 409 })
      }
    }

    if (cnpj) {
      const cnpjInUse = await prisma.company.findFirst({
        where: { cnpj, NOT: { id: existingUser.companyId } },
      })
      if (cnpjInUse) {
        return NextResponse.json({ message: "Este CNPJ já está cadastrado" }, { status: 409 })
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const userData: { email?: string; passwordHash?: string; role?: "ADMIN" | "USER" } = {}
      if (email) userData.email = email
      if (password) userData.passwordHash = await bcrypt.hash(password, 10)
      if (role) userData.role = role

      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id }, data: userData })
      }

      if (company || cnpj) {
        const companyData: { socialName?: string; cnpj?: string } = {}
        if (company) companyData.socialName = company
        if (cnpj) companyData.cnpj = cnpj

        await tx.company.update({
          where: { id: existingUser.companyId },
          data: companyData,
        })
      }

      if (items) {
        // substitui toda a configuração de itens do usuário (o cascade cuida das subcategorias)
        await tx.userItemConfig.deleteMany({ where: { userId: id } })

        await Promise.all(
          items.map(async (item) => {
            const dbItem = await tx.item.upsert({
              where: { name_mealType: { name: item.name, mealType: item.mealType } },
              update: {},
              create: { name: item.name, mealType: item.mealType },
            })

            const userItemConfig = await tx.userItemConfig.create({
              data: {
                userId: id,
                itemId: dbItem.id,
                weekdayQuantity: item.weekdayQuantity ?? null,
                saturdayQuantity: item.saturdayQuantity ?? null,
                sundayQuantity: item.sundayQuantity ?? null,
              },
            })

            if (item.subcategories?.length) {
              await Promise.all(
                item.subcategories.map(async (sub) => {
                  const dbSubcategory = await tx.subcategory.upsert({
                    where: { name_mealType: { name: sub.name, mealType: item.mealType } },
                    update: {},
                    create: { name: sub.name, mealType: item.mealType },
                  })

                  await tx.userSubcategoryConfig.create({
                    data: {
                      userItemId: userItemConfig.id,
                      subcategoryId: dbSubcategory.id,
                      weekdayQuantity: sub.weekdayQuantity ?? null,
                      saturdayQuantity: sub.saturdayQuantity ?? null,
                      sundayQuantity: sub.sundayQuantity ?? null,
                    },
                  })
                })
              )
            }
          })
        )
      }

      return tx.user.findUnique({
        where: { id },
        include: {
          company: true,
          itemConfigs: {
            include: { item: true, subcategories: { include: { subcategory: true } } },
          },
        },
      })
    }, { timeout: 15000 })

    return NextResponse.json(updatedUser)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Erro ao atualizar usuário" }, { status: 500 })
  }
}