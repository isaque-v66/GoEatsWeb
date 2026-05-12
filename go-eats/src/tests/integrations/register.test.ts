import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../../app/api/registerUser/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}))

describe("POST /api/registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validPayload = {
    user: {
      email: "teste@email.com",
      password: "123456",
    },
    company: {
      cnpj: "12345678000199",
      socialName: "Empresa Teste",
    },
    items: [
      {
        name: "Arroz",
        mealType: "ALMOCO",
        defaultQuantity: 1,
        subcategories: [
          {
            name: "Integral",
            defaultQuantity: 1,
          },
        ],
      },
    ],
  }

  it("deve registrar usuário com sucesso", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never)

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: "user-id",
            email: "teste@email.com",
            companyId: "company-id",
            createdAt: new Date(),
          }),
        },
        company: {
          upsert: vi.fn().mockResolvedValue({
            id: "company-id",
          }),
        },
        item: {
          upsert: vi.fn().mockResolvedValue({
            id: "item-id",
          }),
        },
        userItemConfig: {
          create: vi.fn().mockResolvedValue({
            id: "config-id",
          }),
        },
        subcategory: {
          upsert: vi.fn().mockResolvedValue({
            id: "subcategory-id",
          }),
        },
        userSubcategoryConfig: {
          create: vi.fn().mockResolvedValue({}),
        },
      }

      return callback(tx)
    })

    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify(validPayload),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
  })

  it("deve retornar 400 se dados estiverem incompletos", async () => {
    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe("Dados incompletos")
  })

  it("deve retornar 400 se email ou senha não forem enviados", async () => {
    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify({
        user: {
          email: "",
          password: "",
        },
        company: {
          cnpj: "123",
          socialName: "Empresa",
        },
        items: [{ name: "Arroz", mealType: "ALMOCO" }],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe("Email e senha são obrigatórios")
  })

  it("deve retornar 400 se item não possuir mealType", async () => {
    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify({
        ...validPayload,
        items: [
          {
            name: "Arroz",
          },
        ],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toContain("mealType")
  })

  it("deve retornar 400 se subcategoria for inválida", async () => {
    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify({
        ...validPayload,
        items: [
          {
            name: "Arroz",
            mealType: "ALMOCO",
            subcategories: [{}],
          },
        ],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe("Subcategoria inválida")
  })

  it("deve retornar 409 se usuário já existir", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never)

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: "existing-user",
          }),
        },
      }

      return callback(tx)
    })

    const req = new Request("http://localhost/api/registerUser", {
      method: "POST",
      body: JSON.stringify(validPayload),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.message).toBe("Usuário já existe")
  })
})