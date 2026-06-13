import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../../app/api/login/route"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}))

describe("POST /api/login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve retornar 400 se email ou senha não forem enviados", async () => {
    const req = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it("deve retornar 404 se usuário não existir", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const req = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "teste@email.com",
        password: "123456",
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.message).toBe("Credenciais inválidas")
  })

  it("deve retornar 401 se senha estiver incorreta", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "teste@email.com",
      passwordHash: "hash",
      companyId: "company-1",
      company: {                        
      socialName: "Empresa Teste",
      cnpj: "00.000.000/0001-00",
    },
    } as any)

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const req = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "teste@email.com",
        password: "senha-errada",
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe("Credenciais inválidas")
  })

  it("deve fazer login com sucesso", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1",
      email: "teste@email.com",
      passwordHash: "hash",
      companyId: "company-1",
      company: {                        
      socialName: "Empresa Teste",
      cnpj: "00.000.000/0001-00",
    },
    } as any)

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    vi.mocked(prisma.session.create).mockResolvedValue({
      id: "session-1",
    } as any)

    const req = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: "teste@email.com",
        password: "123456",
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.user.email).toBe("teste@email.com")
  })
})