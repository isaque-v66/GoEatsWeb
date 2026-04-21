import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function GET(req: Request) {
  try {
    
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "Usuário não informado" },
        { status: 401 }
      )
    }

    const configs = await prisma.userItemConfig.findMany({
      where: { userId },
      include: {
        item: true,
        subcategories: {
          include: {
            subcategory: true,
          },
        },
      },
    })

    const itemsMap = new Map<string, {
      name: string
      mealType: string
      subcategories?: {
        name: string
        defaultQuantity: number | null
      }[]
    }>()

    for (const config of configs) {
      const key = config.item.name

      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: config.item.name,
          mealType: config.item.mealType,
          subcategories: [],
        })
      }

      for (const sc of config.subcategories) {
        itemsMap.get(key)!.subcategories!.push({
          name: sc.subcategory.name,
          defaultQuantity: sc.defaultQuantity,
        })
      }
    }

    const items = Array.from(itemsMap.values()).map(item => {
      if (!item.subcategories?.length) delete item.subcategories
      return item
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro ao buscar itens do dashboard" },
      { status: 500 }
    )
  }
}
