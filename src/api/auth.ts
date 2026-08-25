import { apiClient } from './client'
import type {
  ApiResponse,
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '../types/api'

export async function login(input: LoginInput): Promise<string> {
  const res = await apiClient.post<ApiResponse<string>>('/login', input)
  return res.data.data
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>(
    '/register/general',
    input,
  )
  return res.data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout')
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiClient.get<User>('/user')
  return res.data
}
