import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest"

vi.mock("@/src/lib/email", () => ({
  sendEmailBatch: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    scheduledOrder: { findMany: vi.fn() },
    order: { findMany: vi.fn() },
  },
}))

import { runCron } from "@/src/lib/cron-logic"
import { sendEmailBatch } from "@/src/lib/email"
import { prisma } from "@/lib/prisma"

// ── Helpers ──

function makeUser(overrides = {}) {
  return {
    id: "user-1",
    isActive: true,

    company: {
      socialName: "Empresa Teste",
      cnpj: "00.000.000/0001-00",
    },

    itemConfigs: [
      {
        id: "config-1",
        itemId: "item-desjejum",

        mondayQuantity: 2,
        tuesdayQuantity: 2,
        wednesdayQuantity: 2,
        thursdayQuantity: 2,
        fridayQuantity: 2,
        saturdayQuantity: 1,
        sundayQuantity: 0,

        comment: null,
        subcategories: [],

        item: {
          id: "item-desjejum",
          name: "Desjejum",
          mealType: "DESJEJUM",
        },
      },
    ],

    ...overrides,
  }
}

function makeUserWithSub() {
  return {
    id: "user-2",
    isActive: true,

    company: {
      socialName: "Empresa Sub",
      cnpj: "11.111.111/0001-11",
    },

    itemConfigs: [
      {
        id: "config-2",
        itemId: "item-bebidas",

        mondayQuantity: null,
        tuesdayQuantity: null,
        wednesdayQuantity: null,
        thursdayQuantity: null,
        fridayQuantity: null,
        saturdayQuantity: null,
        sundayQuantity: null,

        comment: null,

        item: {
          id: "item-bebidas",
          name: "Bebidas",
          mealType: "BEBIDAS",
        },

        subcategories: [
          {
            id: "subconfig-1",
            subcategoryId: "sub-agua",

            mondayQuantity: 3,
            tuesdayQuantity: 3,
            wednesdayQuantity: 3,
            thursdayQuantity: 3,
            fridayQuantity: 3,
            saturdayQuantity: 2,
            sundayQuantity: 1,

            comment: null,

            subcategory: {
              id: "sub-agua",
              name: "Água",
              mealType: "BEBIDAS",
            },
          },
        ],
      },
    ],
  }
}

function mockSendEmailBatchEcho() {
  vi.mocked(sendEmailBatch).mockImplementation(async (emails: any[]) => ({
    sent: emails.map(e => ({ ...e, resendId: "test-id" })),
    failed: [],
  }))
}

describe("cron — disparo de emails automáticos", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    vi.mocked(prisma.user.findMany).mockResolvedValue([] as any)
    vi.mocked(prisma.scheduledOrder.findMany).mockResolvedValue([] as any)
    vi.mocked(prisma.order.findMany).mockResolvedValue([] as any)

    mockSendEmailBatchEcho()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("cron 14:30 — Desjejum/Bebidas", () => {
    it("envia email com quantidade padrão do dia seguinte", async () => {
      // Segunda-feira -> deve gerar pedido para terça-feira (tuesdayQuantity)
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()

      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails).toHaveLength(1)
      expect(emails[0].companyName).toBe("Empresa Teste")
      expect(emails[0].subject).toContain("Empresa Teste")
      expect(emails[0].message).toContain("Desjejum")
      expect(emails[0].message).toContain("2")
    })

    it("envia para sábado E domingo quando cron dispara na sexta-feira", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00")) // sexta-feira

      const userWithWeekend = makeUser({
        itemConfigs: [
          {
            id: "config-1",
            itemId: "item-desjejum",
            mondayQuantity: 2,
            tuesdayQuantity: 2,
            wednesdayQuantity: 2,
            thursdayQuantity: 2,
            fridayQuantity: 2,
            saturdayQuantity: 1,
            sundayQuantity: 3,
            comment: null,
            subcategories: [],
            item: { id: "item-desjejum", name: "Desjejum", mealType: "DESJEJUM" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userWithWeekend] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).toContain("1")
      expect(emails[0].message).toContain("3")
    })

    it("usa saturdayQuantity=1 quando target é sábado", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00")) // sexta -> sábado é o primeiro target

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).toContain("1")
    })

    it("pula domingo quando sundayQuantity = 0 e não há fallback", async () => {
      vi.setSystemTime(new Date("2025-06-13T14:30:00")) // sexta -> sábado + domingo

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).not.toMatch(/domingo.*Desjejum.*0/i)
    })
  })

  describe("pedido especial (ScheduledOrder)", () => {
    it("usa quantidade do ScheduledOrder quando existe para o dia alvo, sobrescrevendo o padrão", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00")) // segunda -> terça

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser()] as any)

      vi.mocked(prisma.scheduledOrder.findMany).mockResolvedValue([
        {
          id: "sched-1",
          userId: "user-1",
          date: new Date("2025-06-10T00:00:00"),
          items: [
            {
              itemId: "item-desjejum",
              quantity: 99,
              comment: null,
              item: { name: "Desjejum", mealType: "DESJEJUM" },
              subcategory: null,
            },
          ],
        },
      ] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]

      expect(emails[0].message).toContain("99")
      expect(emails[0].message).not.toMatch(/Desjejum: 2\b/)
    })
  })

  describe("fallback — pedido do dia anterior", () => {
    it("usa pedido anterior quando padrão é 0 e não há ScheduledOrder", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00")) // segunda -> terça; ontem = segunda

      const userZero = makeUser({
        itemConfigs: [
          {
            id: "config-zero",
            itemId: "item-desjejum",
            mondayQuantity: 0,
            tuesdayQuantity: 0,
            wednesdayQuantity: 0,
            thursdayQuantity: 0,
            fridayQuantity: 0,
            saturdayQuantity: 0,
            sundayQuantity: 0,
            comment: null,
            subcategories: [],
            item: { id: "item-desjejum", name: "Desjejum", mealType: "DESJEJUM" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userZero] as any)

      vi.mocked(prisma.order.findMany).mockResolvedValue([
        {
          id: "order-prev",
          userId: "user-1",
          mealType: "DESJEJUM",
          date: new Date("2025-06-09T00:00:00"),
          items: [
            {
              itemId: "item-desjejum",
              quantity: 5,
              customText: null,
              item: { name: "Desjejum", mealType: "DESJEJUM" },
              subcategory: null,
            },
          ],
        },
      ] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).toContain("5")
    })
  })

  describe("itens com subcategorias", () => {
    it("envia subcategorias com quantidade padrão correta", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00")) // segunda -> terça

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUserWithSub()] as any)

      await runCron("1430")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).toContain("Água")
      expect(emails[0].message).toContain("3")
    })
  })

  describe("edge cases", () => {
    it("não envia email quando usuário não tem itemConfigs relevantes para o cron", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      // Simula o que o Prisma já retornaria filtrado: para o cron 1430
      // (Desjejum/Bebidas/...), um usuário só com Almoço não teria
      // nenhum itemConfig retornado pela query real.
      const userAlmocoOnly = makeUser({ itemConfigs: [] })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userAlmocoOnly] as any)

      await runCron("1430")

      expect(sendEmailBatch).not.toHaveBeenCalled()
    })

    it("não envia email quando não há usuários ativos", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([] as any)

      await runCron("1430")

      expect(sendEmailBatch).not.toHaveBeenCalled()
    })

    it("cron 08:00 cobre somente Almoço e Lanche", async () => {
      vi.setSystemTime(new Date("2025-06-09T08:00:00")) // segunda -> terça

      const userAlmoco = makeUser({
        itemConfigs: [
          {
            id: "config-almoco",
            itemId: "item-almoco",
            mondayQuantity: 4,
            tuesdayQuantity: 4,
            wednesdayQuantity: 4,
            thursdayQuantity: 4,
            fridayQuantity: 4,
            saturdayQuantity: 0,
            sundayQuantity: 0,
            comment: null,
            subcategories: [],
            item: { id: "item-almoco", name: "Almoço", mealType: "ALMOCO" },
          },
        ],
      })

      vi.mocked(prisma.user.findMany).mockResolvedValue([userAlmoco] as any)

      await runCron("0800")

      expect(sendEmailBatch).toHaveBeenCalledOnce()
      const emails = vi.mocked(sendEmailBatch).mock.calls[0][0]
      expect(emails[0].message).toContain("Almoço")
      expect(emails[0].message).toContain("4")
    })

    it("não chama sendEmailBatch quando não há nenhum e-mail pendente", async () => {
      vi.setSystemTime(new Date("2025-06-09T14:30:00"))

      vi.mocked(prisma.user.findMany).mockResolvedValue([makeUser({ itemConfigs: [] })] as any)

      const result = await runCron("1430")

      expect(sendEmailBatch).not.toHaveBeenCalled()
      expect(result.emailsSent).toBe(0)
    })
  })
})