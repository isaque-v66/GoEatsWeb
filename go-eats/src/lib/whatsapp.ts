export async function sendWhatsApp(message: string) {
  const instanceId = process.env.ZAPI_INSTANCE_ID
  const token = process.env.ZAPI_TOKEN
  const phone = process.env.ZAPI_PHONE

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      message,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error("Erro ao enviar WhatsApp: " + error)
  }

  return response.json()
}