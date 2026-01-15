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

    
    const passwordHash = await bcrypt.hash(user.password, 10)

    const result = await prisma.$transaction(async tx => {
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
          where: { name: item.name },
          update: {},
          create: { name: item.name },
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
                name_itemId: {
                  name: sub.name,
                  itemId: dbItem.id,
                },
              },
              update: {},
              create: {
                name: sub.name,
                itemId: dbItem.id,
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
    return NextResponse.json(
      { error: "Erro interno ao registrar usuário" },
      { status: 500 }
    )
  }
}
