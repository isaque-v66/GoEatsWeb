import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../../app/api/createOrder/route"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}))

describe("POST /api/createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deve retornar 400 se pedido estiver vazio", async () => {
    const req = new Request("http://localhost/api/createOrder", {
      method: "POST",
      body: JSON.stringify({
        userId: "1",
        companyId: "1",
        orders: {
          items: [],
        },
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Pedido vazio")
  })

  it("deve retornar 400 se mealType não existir", async () => {
    const req = new Request("http://localhost/api/createOrder", {
      method: "POST",
      body: JSON.stringify({
        userId: "1",
        companyId: "1",
        orders: {
          items: [
            {
              item: "Almoço",
            },
          ],
        },
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("MealType não definido")
  })

  it("deve retornar 400 se houver mealTypes diferentes", async () => {
    const req = new Request("http://localhost/api/createOrder", {
      method: "POST",
      body: JSON.stringify({
        userId: "1",
        companyId: "1",
        orders: {
          items: [
            {
              item: "Almoço",
              mealType: "ALMOCO",
            },
            {
              item: "Jantar",
              mealType: "JANTAR",
            },
          ],
        },
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe(
      "Todos os itens devem ser do mesmo tipo de refeição"
    )
  })

  it("deve criar pedido com sucesso", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue({
      id: "order-123",
    } as never)

    const req = new Request("http://localhost/api/createOrder", {
      method: "POST",
      body: JSON.stringify({
        userId: "1",
        companyId: "1",
        orders: {
          items: [
            {
              item: "Almoço",
              mealType: "ALMOCO",
              quantity: 1,
            },
          ],
        },
      }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.orderId).toBe("order-123")
  })
})