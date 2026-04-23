import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MealType } from "@prisma/client"

type SubcategoryPayload = {
  name: string
  quantity?: number
}

type OrderPayload = {
  item: string
  mealType: MealType
  quantity?: number
  subcategories?: SubcategoryPayload[]
}

export async function POST(req: Request) {
  try {
    const { userId, companyId, orders } = await req.json()

    
    if (!userId || !companyId) {
      return NextResponse.json(
        { error: "userId ou companyId não enviados" },
        { status: 400 }
      )
    }

    if (!orders?.items?.length) {
         console.log("ERRO: Pedido vazio")
      return NextResponse.json(
        { error: "Pedido vazio" },
        { status: 400 }
      )
    }

    const items: OrderPayload[] = orders.items

    
    if (!items[0]?.mealType) {
        console.log("ERRO: MealType não definido")
      return NextResponse.json(
        { error: "MealType não definido" },
        { status: 400 }
      )
    }

    const mealTypes = new Set(items.map(i => i.mealType))

    if (mealTypes.size > 1) {
        console.log("ERRO: MealTypes diferentes", items.map(i => i.mealType))
      return NextResponse.json(
        { error: "Todos os itens devem ser do mesmo tipo de refeição" },
        { status: 400 }
      )
    }

    const mealType: MealType = items[0].mealType

    
    const now = new Date()
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const result = await prisma.$transaction(async (tx) => {
    
      const createdOrder = await tx.order.create({
        data: {
          userId,
          companyId,
          mealType,
          date: today,
        },
      })

      // 2. Criar itens
      for (const item of items) {
        const dbItem = await tx.item.findUnique({
          where: {
            name_mealType: {
              name: item.item,
              mealType: item.mealType,
            },
          },
        })

        if (!dbItem) continue

        
        if (!item.subcategories?.length) {
          await tx.orderItem.create({
            data: {
              orderId: createdOrder.id,
              itemId: dbItem.id,
              quantity: item.quantity ?? 0,
            },
          })
        }

      
        if (item.subcategories?.length) {
          for (const sub of item.subcategories) {
            const dbSub = await tx.subcategory.findUnique({
              where: {
                name_mealType: {
                  name: sub.name,
                  mealType: item.mealType,
                },
              },
            })

            if (!dbSub) continue

            await tx.orderItem.create({
              data: {
                orderId: createdOrder.id,
                itemId: dbItem.id,
                subcategoryId: dbSub.id,
                quantity: sub.quantity ?? 0,
              },
            })
          }
        }
      }

      return createdOrder
    })

    return NextResponse.json({ orderId: result.id })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    )
  }
}