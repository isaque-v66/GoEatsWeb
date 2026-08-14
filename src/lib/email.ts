import nodemailer from "nodemailer"

type SendEmailParams = {
  message: string
  subject?: string
}

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,        
      maxConnections: 3,
      maxMessages: 100,
    })
  }
  return cachedTransporter
}

export async function sendEmail({ message, subject = "Novo Pedido" }: SendEmailParams) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject,
    text: message,
  })
}