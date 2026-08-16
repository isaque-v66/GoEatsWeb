import * as Sentry from "@sentry/nextjs"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_ATTEMPTS = 5
const BACKOFF_MINUTES = [2, 5, 15, 30, 60]

function nextRetryDelay(attempts: number): Date {
  const idx = Math.min(attempts, BACKOFF_MINUTES.length - 1)
  return new Date(Date.now() + BACKOFF_MINUTES[idx] * 60 * 1000)
}

type PersistFailedEmailParams = {
  subject: string
  message: string
  companyName?: string
  error: string
}

/**
 * Nunca lança exceção — se a própria persistência falhar, só loga.
 */
export async function persistFailedEmail(params: PersistFailedEmailParams) {
  try {
    await prisma.emailLog.create({
      data: {
        subject: params.subject,
        message: params.message,
        companyName: params.companyName,
        status: "PENDING",
        attempts: 1,
        lastError: params.error,
        nextRetryAt: nextRetryDelay(1),
      },
    })
  } catch (err) {
    console.error("[email-retry] Falha ao persistir e-mail para retry:", err)
  }
}

/**
 * Processa os e-mails pendentes de reenvio. Chamado pelo cron de retry,
 * a cada execução, com limite de lote por segurança.
 */
export async function processEmailRetries() {
  const from = process.env.EMAIL_FROM
  const to = process.env.EMAIL_TO

  

  if (!from || !to) {
    console.error("[email-retry] EMAIL_FROM/EMAIL_TO não configurados")
    return { retried: 0, succeeded: 0, stillFailed: 0, exhausted: 0 }
  }

  const now = new Date()

  const due = await prisma.emailLog.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: MAX_ATTEMPTS },
      nextRetryAt: { lte: now },
    },
    orderBy: { nextRetryAt: "asc" },
    take: 50, // limite de segurança por execução
  })

  let succeeded = 0
  let stillFailed = 0
  let exhausted = 0

  for (const entry of due) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject: entry.subject,
        text: entry.message,
      })

      if (error || !data?.id) {
        throw new Error(error?.message ?? "Resend não retornou o ID do e-mail")
      }

      await prisma.emailLog.update({
        where: { id: entry.id },
        data: {
          status: "SENT",
          resendId: data.id,
          attempts: entry.attempts + 1,
        },
      })

      succeeded++
      console.log(`[email-retry] Reenvio bem-sucedido: ${entry.subject} (${entry.companyName ?? "—"})`)
    } catch (err) {
      const attempts = entry.attempts + 1
      const isExhausted = attempts >= MAX_ATTEMPTS
      const errorMessage = err instanceof Error ? err.message : String(err)

      await prisma.emailLog.update({
        where: { id: entry.id },
        data: {
          attempts,
          status: isExhausted ? "EXHAUSTED" : "FAILED",
          lastError: errorMessage,
          nextRetryAt: nextRetryDelay(attempts),
        },
      })

      if (isExhausted) {
        exhausted++
        console.error(
          `[email-retry] Esgotou tentativas (${MAX_ATTEMPTS}): "${entry.subject}" (${entry.companyName ?? "—"}). Requer intervenção manual.`
        )

        Sentry.captureMessage(
        `E-mail esgotou tentativas de reenvio: ${entry.subject}`,
        {
          level: "error",

          tags: {
            type: "email_exhausted",
          },

          extra: {
            emailLogId: entry.id,
            companyName: entry.companyName,
            subject: entry.subject,
            lastError: errorMessage,
            attempts,
          },
        }
      )
      } else {
        stillFailed++
        console.warn(`[email-retry] Tentativa ${attempts}/${MAX_ATTEMPTS} falhou: ${entry.subject}`)
      }
    }
  }

  return { retried: due.length, succeeded, stillFailed, exhausted }
}