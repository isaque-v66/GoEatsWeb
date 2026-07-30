import { NextRequest, NextResponse } from "next/server"
import { runCron } from "@/src/lib/cron-logic"

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const result = await runCron("0800")
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error("[cron:0800] Erro:", err)
    return NextResponse.json({ error: "Erro ao executar cron" }, { status: 500 })
  }
}
