import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cnpj = searchParams.get("cnpj")?.replace(/\D/g, "") ?? ""

    if (!cnpj) {
      return NextResponse.json({ exists: false })
    }

    const company = await prisma.company.findUnique({
      where: { cnpj },
      select: { id: true },
    })

    return NextResponse.json({ exists: !!company })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}