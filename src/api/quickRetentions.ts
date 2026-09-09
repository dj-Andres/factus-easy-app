import { apiClient } from './client'
import type { ApiResponse, LaravelPagination, QuickRetention, QuickRetentionInput } from '../types/api'

export interface QuickRetentionListParams {
  ruc: string
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export async function getQuickRetentions(
  params: QuickRetentionListParams,
): Promise<LaravelPagination<QuickRetention>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<QuickRetention>>>(
    '/document/quick-retentions',
    { params },
  )
  return res.data.data
}

export async function getQuickRetention(ruc: string, id: number): Promise<QuickRetention> {
  const res = await apiClient.get<ApiResponse<QuickRetention>>(`/document/quick-retentions/${id}`, {
    params: { ruc },
  })
  return res.data.data
}

export async function createQuickRetention(data: QuickRetentionInput): Promise<QuickRetention> {
  const res = await apiClient.post<ApiResponse<QuickRetention>>('/document/quick-retention', data)
  return res.data.data
}

export async function updateQuickRetention(id: number, data: QuickRetentionInput): Promise<QuickRetention> {
  const res = await apiClient.put<ApiResponse<QuickRetention>>(`/document/quick-retention/${id}`, data)
  return res.data.data
}

export async function sendQuickRetention(id: number, ruc: string): Promise<QuickRetention> {
  const res = await apiClient.post<ApiResponse<QuickRetention>>(`/document/quick-retention/${id}/send`, {
    ruc,
  })
  return res.data.data
}

export async function downloadRide(accessKey: string, ruc: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/document/${accessKey}/ride`, {
    params: { ruc },
    responseType: 'blob',
  })
  return res.data
}