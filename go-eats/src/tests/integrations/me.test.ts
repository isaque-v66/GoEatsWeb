import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../../app/api/me/route"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("GET /api/me", () => {
  const getMock = vi.fn()
  const deleteMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(cookies as any).mockResolvedValue({
      get: getMock,
      delete: deleteMock,
    })
  })

  it("deve retornar 401 se não houver session_id", async () => {
    getMock.mockReturnValue(undefined)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      user: null,
    })
  })

  it("deve retornar 401 se a sessão não existir", async () => {
    getMock.mockReturnValue({
      value: "session-id",
    })

    ;(prisma.session.findUnique as any).mockResolvedValue(null)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      user: null,
    })

    expect(deleteMock).toHaveBeenCalledWith("session_id")
  })

  it("deve retornar 401 e remover sessão expirada", async () => {
    getMock.mockReturnValue({
      value: "session-id",
    })

    const expiredSession = {
      id: "session-id",
      expiresAt: new Date(Date.now() - 1000),
      user: {
        id: "user-id",
        email: "teste@email.com",
        companyId: "company-id",
        company: {
          socialName: "Empresa Teste",
        },
      },
    }

    ;(prisma.session.findUnique as any).mockResolvedValue(
      expiredSession
    )

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      user: null,
    })

    expect(deleteMock).toHaveBeenCalledWith("session_id")

    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: {
        id: "session-id",
      },
    })
  })

  it("deve retornar usuário autenticado se sessão for válida", async () => {
    getMock.mockReturnValue({
      value: "session-id",
    })

    const validSession = {
      id: "session-id",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user: {
        id: "user-id",
        email: "teste@email.com",
        companyId: "company-id",
        company: {
          socialName: "Empresa Teste",
        },
      },
    }

    ;(prisma.session.findUnique as any).mockResolvedValue(
      validSession
    )

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)

    expect(body).toEqual({
      user: {
        id: "user-id",
        email: "teste@email.com",
        name: "Empresa Teste",
        companyId: "company-id",
      },
    })
  })
})