import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"


vi.mock("@/src/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("node-cron", () => ({
  default: { schedule: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    scheduledOrder: { findFirst: vi.fn() },
    order: { findFirst: vi.fn() },
  },
}))


import { runCron } from "@/src/lib/cron"
import { sendEmail } from "@/src/lib/email"
import { prisma } from "@/lib/prisma"



// Helpers 

function makeUser(overrides = {}) {
  return {
    id: "user-1",
    isActive: true,
    company: { socialName: "Empresa Teste", cnpj: "00.000.000/0001-00" },
    itemConfigs: [
      {
        id: "config-1",
        itemId: "item-desjejum",
        weekdayQuantity: 2,
        saturdayQuantity: 1,
        sundayQuantity: 0,
        subcategories: [],
        item: { id: "item-desjejum", name: "Desjejum", mealType: "DESJEJUM" },
      },
    ],
    ...overrides,
  }
}

function makeUserWithSub() {
  return {
    id: "user-2",
    isActive: true,
    company: { socialName: "Empresa Sub", cnpj: "11.111.111/0001-11" },
    itemConfigs: [
      {
        id: "config-2",
        itemId: "item-bebidas",
        weekdayQuantity: null,
        saturdayQuantity: null,
        sundayQuantity: null,
        item: { id: "item-bebidas", name: "Bebidas", mealType: "BEBIDAS" },
        subcategories: [
          {
            id: "subconfig-1",
            subcategoryId: "sub-agua",
            weekdayQuantity: 3,
            saturdayQuantity: 2,
            sundayQuantity: 1,
            subcategory: { id: "sub-agua", name: "Água", mealType: "BEBIDAS" },
          },
        ],
      },
    ],
  }
}







// ── Testes 

describe("cron — disparo de emails automáticos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("cron 14:30 — Desjejum/Bebidas", () => {
    it("envia email com quantidade padrão weekday para o dia seguinte", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("1430")

      expect(sendEmail).toHaveBeenCalledOnce()
      const { subject, message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(subject).toContain("Empresa Teste")
      expect(message).toContain("Desjejum")
      expect(message).toContain("2")
    })

    it("envia para sábado E domingo quando cron dispara na sexta-feira", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00"))

       const userWithWeekend = makeUser({
            itemConfigs: [
            {
                id: "config-1",
                itemId: "item-desjejum",
                weekdayQuantity: 2,
                saturdayQuantity: 1,
                sundayQuantity: 3,  // ← era 0, domingo era pulado corretamente
                subcategories: [],
                item: { id: "item-desjejum", name: "Desjejum", mealType: "DESJEJUM" },
            },
            ],
        })

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("1430")

      expect(sendEmail).toHaveBeenCalledOnce()
      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
     
      
      
        expect(message).toContain("1") // saturdayQuantity
        expect(message).toContain("3") // sundayQuantity
    })

    it("usa saturdayQuantity=1 quando target é sábado", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("1430")

      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).toContain("1")
    })

    it("pula domingo quando sundayQuantity = 0 e não há fallback", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("1430")

      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).not.toMatch(/domingo.*Desjejum.*0/i)
    })
  })

  describe("pedido especial (ScheduledOrder)", () => {
    it("usa quantidade do ScheduledOrder quando existe para o dia alvo", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue({
        id: "sched-1",
        items: [
          {
            itemId: "item-desjejum",
            quantity: 99,
            item: { name: "Desjejum", mealType: "DESJEJUM" },
            subcategory: null,
          },
        ],
      } as any)

      await runCron("1430")

      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).toContain("99")
      expect(message).toContain("pedido especial")
    })
  })

  describe("fallback — pedido do dia anterior", () => {
    it("usa pedido anterior quando padrão é 0 e não há ScheduledOrder", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      const userZero = makeUser({
        itemConfigs: [
          {
            id: "config-zero",
            itemId: "item-desjejum",
            weekdayQuantity: 0,
            saturdayQuantity: 0,
            sundayQuantity: 0,
            subcategories: [],
            item: { id: "item-desjejum", name: "Desjejum", mealType: "DESJEJUM" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userZero] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        id: "order-prev",
        items: [
          {
            itemId: "item-desjejum",
            quantity: 5,
            item: { name: "Desjejum", mealType: "DESJEJUM" },
            subcategory: null,
          },
        ],
      } as any)

      await runCron("1430")

      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).toContain("5")
      expect(message).toContain("ref. dia anterior")
    })
  })

  describe("itens com subcategorias", () => {
    it("envia subcategorias com quantidade padrão correta", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUserWithSub()] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("1430")

      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).toContain("Água")
      expect(message).toContain("3")
    })
  })

  describe("edge cases", () => {
    it("não envia email quando usuário não tem itemConfigs relevantes para o cron", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      const userAlmocoOnly = makeUser({
        itemConfigs: [
          {
            id: "config-almoco",
            itemId: "item-almoco",
            weekdayQuantity: 3,
            saturdayQuantity: 0,
            sundayQuantity: 0,
            subcategories: [],
            item: { id: "item-almoco", name: "Almoço", mealType: "ALMOCO" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userAlmocoOnly] as any)

      await runCron("1430")

      expect(sendEmail).not.toHaveBeenCalled()
    })

    it("não envia email quando não há usuários ativos", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))
      vi.mocked(prisma.user.findMany).mockResolvedValue([])

      await runCron("1430")

      expect(sendEmail).not.toHaveBeenCalled()
    })

    it("cron 08:00 cobre somente Almoço e Lanche", async () => {
      vi.setSystemTime(new Date("2025-06-09T08:00:00"))

      const userAlmoco = makeUser({
        itemConfigs: [
          {
            id: "config-almoco",
            itemId: "item-almoco",
            weekdayQuantity: 4,
            saturdayQuantity: 0,
            sundayQuantity: 0,
            subcategories: [],
            item: { id: "item-almoco", name: "Almoço", mealType: "ALMOCO" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userAlmoco] as any)
      vi.mocked(prisma.scheduledOrder.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null)

      await runCron("0800")

      expect(sendEmail).toHaveBeenCalledOnce()
      const { message } = vi.mocked(sendEmail).mock.calls[0][0] as any
      expect(message).toContain("Almoço")
      expect(message).toContain("4")
    })
  })
})