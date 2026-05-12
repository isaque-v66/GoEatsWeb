import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export default async function globalSetup() {
  const email = "teste@goeats.com"

  try {
    // limpa sessões
    await prisma.session.deleteMany()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // busca pedidos do usuário
      const orders = await prisma.order.findMany({
        where: {
          userId: existingUser.id,
        },
        select: {
          id: true,
        },
      })

      const orderIds = orders.map(order => order.id)

      // filhos do pedido
      await prisma.orderItem.deleteMany({
        where: {
          orderId: {
            in: orderIds,
          },
        },
      })

      // pedidos
      await prisma.order.deleteMany({
        where: {
          userId: existingUser.id,
        },
      })

      // permissões do dashboard
      await prisma.userItemConfig.deleteMany({
        where: {
          userId: existingUser.id,
        },
      })

      // usuário
      await prisma.user.delete({
        where: { email },
      })
    }

    const company = await prisma.company.upsert({
      where: {
        cnpj: "12345678000199",
      },
      update: {},
      create: {
        cnpj: "12345678000199",
        socialName: "Empresa Teste",
      },
    })

    const passwordHash = await bcrypt.hash("123456", 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        companyId: company.id,
      },
    })

    // pega itens do dashboard
    const items = await prisma.item.findMany({
      where: {
        mealType: {
          in: [
            "DESJEJUM",
            "ALMOCO",
            "JANTAR",
            "LANCHE",
          ],
        },
      },
    })

    // vincula itens permitidos
    await prisma.userItemConfig.createMany({
      data: items.map(item => ({
        userId: user.id,
        itemId: item.id,
      })),
    })

    console.log("Usuário E2E criado")
  } catch (err) {
    console.error("Erro no setup E2E:", err)
    throw err
  } finally {
    await prisma.$disconnect()
  }
}