import nodemailer from "nodemailer"

type SendEmailParams = {
  subject: string
  message: string
}

export async function sendEmail({
  subject,
  message,
}: SendEmailParams) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject,
    text: message,
  })
}