import { NextRequest, NextResponse } from "next/server"
import { processEmailRetries } from "@/src/lib/email-retry"

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const result = await processEmailRetries()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("[cron:retry-emails] Erro:", err)
    return NextResponse.json({ error: "Erro ao processar retries" }, { status: 500 })
  }
}