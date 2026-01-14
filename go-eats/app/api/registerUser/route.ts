import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"




const prisma = new PrismaClient()



export async function POST(req: Request) {

    try {
        const body = await req.json()
        const {user, company, items} = body

        if(!user || !company || !items) {
            return NextResponse.json({success: false, message: "dados incompletos. Erro na API"}, {status: 400})
        }


        const result = await prisma.$transaction(async tx => {

            //COMPANY
            const createdCompany = await tx.company.upsert({
                where: {cnpj: company.cnpj},
                update: {
                    socialName: company.socialName
                },
                create: {
                    cnpj: company.cnpj,
                    socialName: company.socialName
                },
            })

            // Fazer o hash da senha


            // USER
            const createdUser = await tx.user.create({
                data: {
                    email: user.email,
                    passwordHash: user.password,
                    companyId: createdCompany.id
                }
            })


            //ITENS + CONFIGURAÇÕES
            for(const item of items) {
                //ITEM
                const dbItem = await tx.item.upsert({
                    where: {name: item.name},
                    update: {},
                    create: {
                        name: item.name
                    },
                })



                // Config do item para o usuário
            const userItemConfig = await tx.userItemConfig.create({
                data: {
                    userId: createdUser.id,
                    itemId: dbItem.id,
                    defaultQuantity: item.defaultQuantity ?? null
                },
            })




              //Subcategorias
            if(item.subcategories?.length) {
                for(const sub of item.subcategories) {
                    const dbSubcategory = await tx.subcategory.upsert({
                        where: {
                            name_itemId: {
                                name: sub.name,
                                itemId: dbItem.id
                            },
                        },
                        update: {},
                        create: {
                            name: sub.name,
                            itemId: dbItem.id
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


    return NextResponse.json({ success: true, result}, { status: 201})


        


    } catch(err) {
        console.error(err)

        return NextResponse.json({ error: "Erro interno ao registrar usuário"}, { status: 500})

    }

}