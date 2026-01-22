import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { user, company, items } = await req.json()

    if (!user || !company || !items?.length) {
      return NextResponse.json(
        { success: false, message: "Dados incompletos" },
        { status: 400 }
      )
    }

    if (!user.email || !user.password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }


    for (const item of items) {
  if (!item.name || !item.mealType) {
    return NextResponse.json(
      {
        success: false,
        message: "Todos os itens devem possuir name e mealType",
        item,
      },
      { status: 400 }
    )
  }

  if (item.subcategories?.length) {
    for (const sub of item.subcategories) {
      if (!sub.name) {
        return NextResponse.json(
          {
            success: false,
            message: "Subcategoria inválida",
            sub,
          },
          { status: 400 }
        )
      }
    }
  }
}


    
    const passwordHash = await bcrypt.hash(user.password, 10)

    const result = await prisma.$transaction(async tx => {

      const existingUser = await tx.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS")
      }




      // COMPANY
      const createdCompany = await tx.company.upsert({
        where: { cnpj: company.cnpj },
        update: { socialName: company.socialName },
        create: {
          cnpj: company.cnpj,
          socialName: company.socialName,
        },
      })

      // USER
      const createdUser = await tx.user.create({
        data: {
          email: user.email,
          passwordHash,
          companyId: createdCompany.id,
        },
        select: {
            id: true,
            email: true,
            companyId: true,
            createdAt: true,
        }
      })

      // ITENS
      for (const item of items) {

        const dbItem = await tx.item.upsert({
        where: {
          name_mealType: {
            name: item.name,
            mealType: item.mealType,
          },
        },
        update: {},
        create: {
          name: item.name,
          mealType: item.mealType,
        },
      })

        const userItemConfig = await tx.userItemConfig.create({
          data: {
            userId: createdUser.id,
            itemId: dbItem.id,
            defaultQuantity: item.defaultQuantity ?? null,
          },
        })

        // SUBCATEGORIAS
        if (item.subcategories?.length) {
          for (const sub of item.subcategories) {
            const dbSubcategory = await tx.subcategory.upsert({
              where: {
                name_mealType: {
                  name: sub.name,
                  mealType: item.mealType,
                },
              },
              update: {},
              create: {
                name: sub.name,
                mealType: item.mealType,
              },
            })


            await tx.userSubcategoryConfig.create({
              data: {
                userItemId: userItemConfig.id,
                subcategoryId: dbSubcategory.id,
                defaultQuantity: sub.defaultQuantity ?? null,
              },
            })
          }
        }
      }

      return {
        userId: createdUser.id,
        companyId: createdCompany.id,
      }
    })

    return NextResponse.json({ success: true, result }, { status: 201 })

  } catch (err) {
    console.error(err)

    if (err instanceof Error) {
    if (err.message === "USER_ALREADY_EXISTS") {
      return NextResponse.json(
        { success: false, message: "Usuário já existe" },
        { status: 409 }
      )
    }

    if (err.message === "ITEM_WITHOUT_MEALTYPE") {
      return NextResponse.json(
        { success: false, message: "Item sem mealType" },
        { status: 400 }
      )
    }


    return NextResponse.json(
      { error: "Erro interno ao registrar usuário" },
      { status: 500 }
    )
  }
  }}
