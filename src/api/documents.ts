import { apiClient } from './client'
import type { ApiResponse, DocumentStatusResult, DocumentStatusQuery } from '../types/api'

export async function getDocumentStatus(query: DocumentStatusQuery): Promise<DocumentStatusResult> {
  const res = await apiClient.get<ApiResponse<DocumentStatusResult>>('/document/status', { params: query })
  return res.data.data
}
