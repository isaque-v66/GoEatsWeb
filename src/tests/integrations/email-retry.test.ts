import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest"

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}))

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { persistFailedEmail, processEmailRetries } from "@/src/lib/email-retry"
import { prisma } from "@/lib/prisma"

describe("email-retry", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.EMAIL_FROM = "pedidos@teste.com"
    process.env.EMAIL_TO = "cozinha@teste.com"
  })

  describe("persistFailedEmail", () => {
   it("grava um EmailLog com status PENDING, attempts=1 e nextRetryAt no futuro", async () => {
        const before = Date.now()

        await persistFailedEmail({
            subject: "Pedidos Almoço - Empresa X",
            message: "conteúdo do email",
            companyName: "Empresa X",
            error: "Falha simulada",
        })

        expect(prisma.emailLog.create).toHaveBeenCalledOnce()

        const data =
            vi.mocked(prisma.emailLog.create).mock.calls[0][0].data as any

        expect(data.status).toBe("PENDING")
        expect(data.attempts).toBe(1)
        expect(data.subject).toBe("Pedidos Almoço - Empresa X")
        expect(data.companyName).toBe("Empresa X")
        expect(data.lastError).toBe("Falha simulada")

        const nextRetryAt = new Date(data.nextRetryAt).getTime()

        expect(nextRetryAt).toBeGreaterThan(before)

        expect(nextRetryAt).toBeLessThanOrEqual(
            before + 16 * 60 * 1000
        )
        })

    it("nunca lança exceção, mesmo se a própria persistência falhar", async () => {
      vi.mocked(prisma.emailLog.create).mockRejectedValue(new Error("DB fora do ar"))

      await expect(
        persistFailedEmail({
          subject: "x",
          message: "y",
          error: "erro original",
        })
      ).resolves.toBeUndefined()
    })
  })

  describe("processEmailRetries", () => {
    it("retorna zeros quando não há env vars configuradas", async () => {
      delete process.env.EMAIL_FROM

      const result = await processEmailRetries()

      expect(result).toEqual({ retried: 0, succeeded: 0, stillFailed: 0, exhausted: 0 })
      expect(prisma.emailLog.findMany).not.toHaveBeenCalled()
    })

    it("retorna zeros quando não há e-mails pendentes de retry", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([])

      const result = await processEmailRetries()

      expect(result).toEqual({ retried: 0, succeeded: 0, stillFailed: 0, exhausted: 0 })
      expect(mockSend).not.toHaveBeenCalled()
    })

    it("marca como SENT quando o reenvio dá certo", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([
        {
          id: "log-1",
          subject: "Pedidos Almoço",
          message: "conteúdo",
          companyName: "Empresa X",
          attempts: 1,
          status: "PENDING",
        },
      ] as any)

      mockSend.mockResolvedValue({ data: { id: "resend-abc" }, error: null })

      const result = await processEmailRetries()

      expect(result).toEqual({ retried: 1, succeeded: 1, stillFailed: 0, exhausted: 0 })

      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: "log-1" },
        data: expect.objectContaining({
          status: "SENT",
          resendId: "resend-abc",
          attempts: 2,
        }),
      })
    })

    it("marca como FAILED e reagenda quando o reenvio falha e ainda não esgotou tentativas", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([
        {
          id: "log-2",
          subject: "Pedidos Jantar",
          message: "conteúdo",
          companyName: "Empresa Y",
          attempts: 1, // vai virar 2, ainda < MAX_ATTEMPTS (5)
          status: "PENDING",
        },
      ] as any)

      mockSend.mockResolvedValue({ data: null, error: { message: "Rate limit" } })

      const result = await processEmailRetries()

      expect(result).toEqual({ retried: 1, succeeded: 0, stillFailed: 1, exhausted: 0 })

      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: "log-2" },
        data: expect.objectContaining({
          status: "FAILED",
          attempts: 2,
          lastError: "Rate limit",
        }),
      })

      const updateCall = vi.mocked(prisma.emailLog.update).mock.calls[0][0] as any
      expect(new Date(updateCall.data.nextRetryAt).getTime()).toBeGreaterThan(Date.now())
    })

    it("marca como EXHAUSTED quando atinge o limite máximo de tentativas", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([
        {
          id: "log-3",
          subject: "Pedidos Ceia",
          message: "conteúdo",
          companyName: "Empresa Z",
          attempts: 4, // vai virar 5 = MAX_ATTEMPTS
          status: "FAILED",
        },
      ] as any)

      mockSend.mockResolvedValue({ data: null, error: { message: "Falha permanente" } })

      const result = await processEmailRetries()

      expect(result).toEqual({ retried: 1, succeeded: 0, stillFailed: 0, exhausted: 1 })

      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: "log-3" },
        data: expect.objectContaining({
          status: "EXHAUSTED",
          attempts: 5,
        }),
      })
    })

    it("trata exceção lançada pelo SDK do Resend como falha (não deixa o processo quebrar)", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([
        {
          id: "log-4",
          subject: "Pedidos Lanche",
          message: "conteúdo",
          companyName: "Empresa W",
          attempts: 1,
          status: "PENDING",
        },
      ] as any)

      mockSend.mockRejectedValue(new Error("Timeout de rede"))

      const result = await processEmailRetries()

      expect(result.stillFailed).toBe(1)
      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: "log-4" },
        data: expect.objectContaining({
          status: "FAILED",
          lastError: "Timeout de rede",
        }),
      })
    })

    it("processa múltiplos e-mails pendentes na mesma execução", async () => {
      vi.mocked(prisma.emailLog.findMany).mockResolvedValue([
        { id: "log-a", subject: "A", message: "a", companyName: "A", attempts: 1, status: "PENDING" },
        { id: "log-b", subject: "B", message: "b", companyName: "B", attempts: 1, status: "PENDING" },
      ] as any)

      mockSend.mockResolvedValue({ data: { id: "resend-xyz" }, error: null })

      const result = await processEmailRetries()

      expect(result.retried).toBe(2)
      expect(result.succeeded).toBe(2)
      expect(mockSend).toHaveBeenCalledTimes(2)
    })
  })
})