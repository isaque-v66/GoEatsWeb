import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";




export async function GET() {
    try {

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                itemConfigs: {
                    select: {
                        defaultQuantity: true,
                        item: {
                            select: {
                                id: true,
                                mealType: true,
                                name: true
                            }
                        }
                    }
                },
                company: {
                    select: {
                        cnpj: true,
                        socialName: true
                    }
                }
            }
        })

        

        return NextResponse.json(users)


    } catch(err) {
        return NextResponse.json({message: `Erro: ${err}`}, {status: 500})
    }
}