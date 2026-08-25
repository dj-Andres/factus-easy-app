import { apiClient } from './client'
import type { ApiResponse, Company } from '../types/api'

export async function getCompanies(): Promise<Company[]> {
  const res = await apiClient.get<ApiResponse<Company[]>>('/companie/list')
  return res.data.data
}
