import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "userId não informado" },
        { status: 400 }
      )
    }

    const scheduledOrders = await prisma.scheduledOrder.findMany({
      where: {
        userId,
        date: { gte: new Date() }, 
      },
      select: { date: true },
    })

    
    const occupiedDates = Array.from(
      new Set(scheduledOrders.map(o => format(o.date, "yyyy-MM-dd")))
    )

    return NextResponse.json({ occupiedDates })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}