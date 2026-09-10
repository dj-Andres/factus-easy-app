import { apiClient } from './client'
import type { ApiResponse, DashboardStatsResult } from '../types/api'

export async function getDashboardStats(ruc: string): Promise<DashboardStatsResult> {
  const res = await apiClient.get<ApiResponse<DashboardStatsResult>>('/dashboard/stats', {
    params: { ruc },
  })
  return res.data.data
}