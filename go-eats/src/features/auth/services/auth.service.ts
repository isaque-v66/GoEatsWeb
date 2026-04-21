import { LoginDataType } from "../components/login-form"



export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}




export async function loginRequest(data: LoginDataType) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const resData = await response.json()

  if (!response.ok) {
    throw new ApiError(resData.message, response.status)
  }

  return resData
}