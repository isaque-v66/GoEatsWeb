import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../../app/api/logOutUser/route"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      delete: vi.fn(),
    },
  },
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("POST /api/logOutUser", () => {
  const deleteMock = vi.fn()
  const getMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    ;(cookies as any).mockResolvedValue({
      get: getMock,
      delete: deleteMock,
    })
  })

  it("deve retornar 204 ao realizar logout com sessão", async () => {
    getMock.mockReturnValue({
      value: "session-123",
    })

    const response = await POST()

    expect(prisma.session.delete).toHaveBeenCalledWith({
      where: {
        id: "session-123",
      },
    })

    expect(deleteMock).toHaveBeenCalledWith("session_id")
    expect(response.status).toBe(204)
  })

  it("deve retornar 204 mesmo sem sessão", async () => {
    getMock.mockReturnValue(undefined)

    const response = await POST()

    expect(prisma.session.delete).not.toHaveBeenCalled()

    expect(deleteMock).toHaveBeenCalledWith("session_id")
    expect(response.status).toBe(204)
  })
})