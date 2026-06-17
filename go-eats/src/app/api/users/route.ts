import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get("page") ?? 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 10)))
    const search = searchParams.get("search")?.trim() ?? ""
    const status = searchParams.get("status") as | "ALL" | "ADMIN" | "USER" | null

    const where: Prisma.UserWhereInput = {
      AND: [
        status === "ADMIN"
          ? { role: "ADMIN" }
          : {},

        status === "USER"
          ? { role: "USER" }
          : {},

        search
          ? {
              OR: [
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  company: {
                    socialName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  company: {
                    cnpj: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {},
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          itemConfigs: {
            select: {
              weekdayQuantity: true,
              saturdayQuantity: true,
              sundayQuantity: true,
              item: {
                select: { id: true, mealType: true, name: true },
              },
            },
          },
          company: {
            select: { cnpj: true, socialName: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: `Erro: ${err}` }, { status: 500 })
  }
}