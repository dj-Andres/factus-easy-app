import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

export interface ApiErrorPayload {
  message: string
  status: number
  code: number
  errors: Record<string, string[]> | null
}

export class ApiError extends Error {
  status: number
  code: number
  errors: Record<string, string[]> | null

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = payload.status
    this.code = payload.code
    this.errors = payload.errors
  }
}

interface EnvelopeLike {
  status?: string
  code?: number
  message?: string
}

interface ValidationErrorLike {
  message?: string
  errors?: Record<string, string[]>
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data
    const status = error.response?.status ?? 0

    if (error.response) {
      if (data && typeof data === 'object' && 'errors' in data) {
        const payload = data as ValidationErrorLike

        return Promise.reject(
          new ApiError({
            message: payload.message ?? 'Error de validación',
            status,
            code: status,
            errors: payload.errors ?? null,
          }),
        )
      }

      if (data && typeof data === 'object' && 'status' in data) {
        const payload = data as EnvelopeLike

        if (payload.status === 'error' || payload.status === 'info') {
          return Promise.reject(
            new ApiError({
              message: payload.message ?? 'Error del servidor',
              status,
              code: payload.code ?? status,
              errors: null,
            }),
          )
        }
      }

      return Promise.reject(
        new ApiError({
          message: 'Error del servidor',
          status,
          code: status,
          errors: null,
        }),
      )
    }

    return Promise.reject(
      new ApiError({
        message: 'Error de conexión. Verifica tu red e inténtalo de nuevo.',
        status: 0,
        code: 0,
        errors: null,
      }),
    )
  },
)
