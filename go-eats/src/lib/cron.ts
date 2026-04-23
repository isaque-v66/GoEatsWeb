import cron from "node-cron"
import { prisma } from "@/lib/prisma"
import { sendWhatsApp } from "./whatsapp"
import { formatOrderMessage } from "../utils/formatOrder"
import { sendEmail } from "./email"


cron.schedule("0 8 * * *", async () => {
  console.log("Verificando pedidos automáticos...")

  const users = await prisma.user.findMany()

  for (const user of users) {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    const todayOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        date: today,
      },
    })

    if (!todayOrder) {
      const yesterdayOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          date: yesterday,
        },
        include: {
            items: {
            include: {
                item: true,
                subcategory: true,
            },
            },
        },
      })

      if (yesterdayOrder) {
        const message = formatOrderMessage(yesterdayOrder)
        await sendEmail(message)
      }
    }
  }
})