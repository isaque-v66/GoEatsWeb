// const { PrismaClient } = require("@prisma/client")

// const prisma = new PrismaClient()

// async function clearDatabase() {
//   await prisma.$transaction([
//     prisma.orderItem.deleteMany(),
//     prisma.order.deleteMany(),
//     prisma.userSubcategoryConfig.deleteMany(),
//     prisma.userItemConfig.deleteMany(),
//     prisma.subcategory.deleteMany(),
//     prisma.item.deleteMany(),
//     prisma.session.deleteMany(),
//     prisma.user.deleteMany(),
//     prisma.company.deleteMany(),
//   ])

//   console.log("Banco limpo com sucesso ✅")
// }

// clearDatabase()
//   .catch(err => {
//     console.error(err)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
