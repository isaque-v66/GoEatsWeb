"use client"

import { UseFormSetError } from "react-hook-form"
import { LoginDataType } from "../components/login-form"
import { ApiError, loginRequest } from "../services/auth.service"
import { useState } from "react"

type LoginOptions = {
  setError: UseFormSetError<LoginDataType>
  onSuccess: (data: any) => void
}

export function useLogin() {
  const [loading, setLoading] = useState(false)

  async function login(data: LoginDataType, options: LoginOptions) {
    const { setError, onSuccess } = options

    try {
      setLoading(true)

      const res = await loginRequest(data)

      onSuccess(res)

    } catch (err) {
      if (err instanceof ApiError) {

        if (err.status === 404) {
          setError("email", {
            type: "server",
            message: err.message
          })
          return
        }

        if (err.status === 401) {
          setError("password", {
            type: "server",
            message: err.message
          })
          return
        }
      }

      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loading }
}