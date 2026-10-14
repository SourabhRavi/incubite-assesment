import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
})

export type ApiErrorBody = {
  error?: string
  message?: string
  details?: unknown
}

export class ApiError extends Error {
  public readonly status: number
  public readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"

    this.status = status
    this.details = details
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const status = error.response?.status ?? 0
      const responseBody = error.response?.data

      const message =
        responseBody?.error ??
        responseBody?.message ??
        (status === 0
          ? "Unable to connect to the server. Check your connection and try again."
          : error.message || `Request failed with status ${status}`)

      return Promise.reject(
        new ApiError(message, status, responseBody?.details)
      )
    }

    return Promise.reject(error)
  }
)
