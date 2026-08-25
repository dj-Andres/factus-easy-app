import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'
import { ApiError } from '../api/client'
import type { RegisterInput, User } from '../types/api'

function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Error inesperado'
}

interface AuthState {
  user: User | null
  token: string | null
  selectedRuc: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  setSelectedRuc: (ruc: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      selectedRuc: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const token = await authApi.login({ email, password })
          set({ token })
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ token: null, isLoading: false, error: toErrorMessage(err) })
          throw err
        }
      },

      register: async (input) => {
        set({ isLoading: true, error: null })

        try {
          const data = await authApi.register(input)
          set({ token: data.token ?? null })
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ token: null, isLoading: false, error: toErrorMessage(err) })
          throw err
        }
      },

      logout: async () => {
        set({ isLoading: true })

        try {
          await authApi.logout()
        } finally {
          set({
            token: null,
            user: null,
            selectedRuc: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      fetchUser: async () => {
        if (!get().token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const user = await authApi.getCurrentUser()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      setSelectedRuc: (ruc) => set({ selectedRuc: ruc }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'factus_easy_auth',
      partialize: (state) => ({ token: state.token, selectedRuc: state.selectedRuc }),
    },
  ),
)
