import { apiClient } from './client'
import type { ApiResponse, SriTax } from '../types/api'

export async function getSriTaxes(): Promise<SriTax[]> {
  const res = await apiClient.get<ApiResponse<SriTax[]>>('/sri-taxes/list')
  return res.data.data
}
