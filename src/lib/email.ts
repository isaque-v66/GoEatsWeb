import { Resend } from "resend"
import { persistFailedEmail } from "./email-retry"

const resend = new Resend(process.env.RESEND_API_KEY)

type SendEmailParams = {
  message: string
  subject?: string
}

export type BatchEmailParams = {
  companyName: string
  subject: string
  message: string
}

export type BatchEmailResult = {
  companyName: string
  subject: string
  message: string
  resendId: string
}

export type BatchEmailFailure = {
  companyName: string
  subject: string
  message: string
  error: string
}

function sanitizeTagValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 256)
}

/**
 * Envio individual.
 */
export async function sendEmail({
  message,
  subject = "Novo Pedido",
}: SendEmailParams) {
  const from = process.env.EMAIL_FROM
  const to = process.env.EMAIL_TO

  if (!from) {
    throw new Error("EMAIL_FROM não configurado")
  }

  if (!to) {
    throw new Error("EMAIL_TO não configurado")
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text: message,
    })

    if (error) {
      throw new Error(
        `Falha ao enviar e-mail: ${error.message}`
      )
    }

    if (!data?.id) {
      throw new Error(
        "Resend não retornou o ID do e-mail"
      )
    }

    return {
      id: data.id,
      queued: false,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : String(err)

    console.error(
      "[sendEmail] Falha no envio, agendando retry:",
      errorMessage
    )

    await persistFailedEmail({
      subject,
      message,
      error: errorMessage,
    })

    return {
      id: null,
      queued: true,
    }
  }
}

/**
 * Envio em lote.
 *
 * O Resend permite até 100 e-mails por chamada.
 */
export async function sendEmailBatch(
  emails: BatchEmailParams[]
): Promise<{
  sent: BatchEmailResult[]
  failed: BatchEmailFailure[]
}> {
  if (emails.length === 0) {
    return {
      sent: [],
      failed: [],
    }
  }

  const from = process.env.EMAIL_FROM
  const to = process.env.EMAIL_TO

  if (!from) {
    throw new Error("EMAIL_FROM não configurado")
  }

  if (!to) {
    throw new Error("EMAIL_TO não configurado")
  }

  const CHUNK_SIZE = 100

  const sent: BatchEmailResult[] = []
  const failed: BatchEmailFailure[] = []

  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE)

    const payload = chunk.map((email) => ({
      from,
      to,
      subject: email.subject,
      text: email.message,

      tags: [
        {
          name: "company",
          value: sanitizeTagValue(email.companyName),
        },
      ],
    }))

    let data: Awaited<
      ReturnType<typeof resend.batch.send>
    >["data"]

    let error: Awaited<
      ReturnType<typeof resend.batch.send>
    >["error"]

    /**
     * Protege contra exceções reais da chamada,
     * como falha de rede, DNS ou timeout.
     */
    try {
      const result = await resend.batch.send(payload)

      data = result.data
      error = result.error
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : String(err)

      console.error(
        "[sendEmailBatch] Exceção ao chamar Resend:",
        errorMessage
      )

      for (const email of chunk) {
        failed.push({
          companyName: email.companyName,
          subject: email.subject,
          message: email.message,
          error: errorMessage,
        })

        await persistFailedEmail({
          subject: email.subject,
          message: email.message,
          companyName: email.companyName,
          error: errorMessage,
        })
      }

      continue
    }

    /**
     * Falha estruturada retornada pela API do Resend.
     */
    if (error) {
      console.error(
        "[sendEmailBatch] Erro no lote:",
        error
      )

      for (const email of chunk) {
        const errorMessage = error.message

        failed.push({
          companyName: email.companyName,
          subject: email.subject,
          message: email.message,
          error: errorMessage,
        })

        await persistFailedEmail({
          subject: email.subject,
          message: email.message,
          companyName: email.companyName,
          error: errorMessage,
        })
      }

      continue
    }

    const results = data?.data ?? []

    /**
     * Quantidade de IDs retornados diferente
     * da quantidade de e-mails enviados.
     */
    if (results.length !== chunk.length) {
      const errorMessage =
        "Quantidade de IDs retornados pelo Resend diferente da quantidade de e-mails enviados"

      console.error(
        "[sendEmailBatch]",
        errorMessage,
        {
          expected: chunk.length,
          received: results.length,
        }
      )

      for (const email of chunk) {
        failed.push({
          companyName: email.companyName,
          subject: email.subject,
          message: email.message,
          error: errorMessage,
        })

        await persistFailedEmail({
          subject: email.subject,
          message: email.message,
          companyName: email.companyName,
          error: errorMessage,
        })
      }

      continue
    }

    /**
     * Processa cada resultado individualmente.
     */
    for (const [index, result] of results.entries()) {
      const email = chunk[index]

      if (!result?.id) {
        const errorMessage =
          "Resend não retornou um ID para este e-mail"

        failed.push({
          companyName: email.companyName,
          subject: email.subject,
          message: email.message,
          error: errorMessage,
        })

        await persistFailedEmail({
          subject: email.subject,
          message: email.message,
          companyName: email.companyName,
          error: errorMessage,
        })

        continue
      }

      sent.push({
        companyName: email.companyName,
        subject: email.subject,
        message: email.message,
        resendId: result.id,
      })
    }
  }

  return {
    sent,
    failed,
  }
}