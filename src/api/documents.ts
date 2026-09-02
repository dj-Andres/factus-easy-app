import { apiClient } from './client'
import type { ApiResponse, DocumentStatusResult, DocumentStatusQuery, DocumentDetailResult } from '../types/api'

export async function getDocumentStatus(query: DocumentStatusQuery): Promise<DocumentStatusResult> {
  const res = await apiClient.get<ApiResponse<DocumentStatusResult>>('/document/status', { params: query })
  return res.data.data
}

export async function getDocumentDetail(accessKey: string, ruc: string): Promise<DocumentDetailResult> {
  const res = await apiClient.get<ApiResponse<DocumentDetailResult>>(`/document/${accessKey}/detail`, {
    params: { ruc },
  })
  return res.data.data
}

export async function downloadDocumentRide(accessKey: string, ruc: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/document/${accessKey}/ride`, {
    params: { ruc },
    responseType: 'blob',
  })
  return res.data
}

export async function downloadDocumentXml(accessKey: string, ruc: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/document/${accessKey}/xml`, {
    params: { ruc },
    responseType: 'blob',
  })
  return res.data
}
