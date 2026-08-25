import { apiClient } from './client'
import type { AnnulmentListResult, AnnulmentRequestInput, AnnulmentResult, ApiResponse } from '../types/api'

export async function requestAnnulment(accessKey: string, data: AnnulmentRequestInput): Promise<AnnulmentResult> {
  const res = await apiClient.post<ApiResponse<AnnulmentResult>>(`/document/${accessKey}/annulment`, data)
  return res.data.data
}

export async function getAnnulmentStatus(accessKey: string): Promise<AnnulmentResult> {
  const res = await apiClient.get<ApiResponse<AnnulmentResult>>(`/document/${accessKey}/annulment`)
  return res.data.data
}

export async function listAnnulments(accessKey: string): Promise<AnnulmentListResult> {
  const res = await apiClient.get<ApiResponse<AnnulmentListResult>>(`/document/${accessKey}/annulment/list`)
  return res.data.data
}
