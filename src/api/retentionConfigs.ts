import { apiClient } from './client'
import type { ApiResponse, RetentionConfig } from '../types/api'

export async function getRetentionConfigs(): Promise<RetentionConfig[]> {
  const res = await apiClient.get<ApiResponse<RetentionConfig[]>>('/retention-configs/list')
  return res.data.data
}
