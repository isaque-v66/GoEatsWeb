import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "../../app/api/dashboard/items/route"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userItemConfig: {
      findMany: vi.fn(),
    },
  },
}))

describe("GET /api/dashboard/items", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve retornar 401 se userId não for informado", async () => {
    const request = new Request(
      "http://localhost:3000/api/dashboard/items"
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(401)

    expect(body).toEqual({
      message: "Usuário não informado",
    })
  })

  it("deve retornar itens agrupados corretamente", async () => {
    ;(prisma.userItemConfig.findMany as any).mockResolvedValue([
      {
        item: {
          name: "Arroz",
          mealType: "ALMOCO",
        },
        subcategories: [
          {
            defaultQuantity: 2,
            subcategory: {
              name: "Integral",
            },
          },
        ],
      },
      {
        item: {
          name: "Feijão",
          mealType: "ALMOCO",
        },
        subcategories: [],
      },
    ])

    const request = new Request(
      "http://localhost:3000/api/dashboard/items?userId=user-123"
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)

    expect(body).toEqual({
      items: [
        {
          name: "Arroz",
          mealType: "ALMOCO",
          subcategories: [
            {
              name: "Integral",
              defaultQuantity: 2,
            },
          ],
        },
        {
          name: "Feijão",
          mealType: "ALMOCO",
        },
      ],
    })
  })

  it("deve remover subcategories quando estiver vazio", async () => {
    ;(prisma.userItemConfig.findMany as any).mockResolvedValue([
      {
        item: {
          name: "Macarrão",
          mealType: "JANTAR",
        },
        subcategories: [],
      },
    ])

    const request = new Request(
      "http://localhost:3000/api/dashboard/items?userId=user-123"
    )

    const response = await GET(request)
    const body = await response.json()

    expect(body).toEqual({
      items: [
        {
          name: "Macarrão",
          mealType: "JANTAR",
        },
      ],
    })
  })

  it("deve retornar 500 em caso de erro", async () => {
    ;(prisma.userItemConfig.findMany as any).mockRejectedValue(
      new Error("Erro no banco")
    )

    const request = new Request(
      "http://localhost:3000/api/dashboard/items?userId=user-123"
    )

    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(500)

    expect(body).toEqual({
      message: "Erro ao buscar itens do dashboard",
    })
  })
})