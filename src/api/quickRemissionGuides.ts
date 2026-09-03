import { apiClient } from './client'
import type {
  ApiResponse,
  LaravelPagination,
  QuickRemissionGuide,
  QuickRemissionGuideInput,
} from '../types/api'

export interface QuickRemissionGuideListParams {
  ruc: string
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export async function getQuickRemissionGuides(
  params: QuickRemissionGuideListParams,
): Promise<LaravelPagination<QuickRemissionGuide>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<QuickRemissionGuide>>>(
    '/document/quick-remission-guides',
    { params },
  )
  return res.data.data
}

export async function getQuickRemissionGuide(ruc: string, id: number): Promise<QuickRemissionGuide> {
  const res = await apiClient.get<ApiResponse<QuickRemissionGuide>>(
    `/document/quick-remission-guides/${id}`,
    { params: { ruc } },
  )
  return res.data.data
}

export async function createQuickRemissionGuide(data: QuickRemissionGuideInput): Promise<QuickRemissionGuide> {
  const res = await apiClient.post<ApiResponse<QuickRemissionGuide>>('/document/quick-remission-guide', data)
  return res.data.data
}

export async function updateQuickRemissionGuide(
  id: number,
  data: QuickRemissionGuideInput,
): Promise<QuickRemissionGuide> {
  const res = await apiClient.put<ApiResponse<QuickRemissionGuide>>(`/document/quick-remission-guide/${id}`, data)
  return res.data.data
}

export async function sendQuickRemissionGuide(id: number, ruc: string): Promise<QuickRemissionGuide> {
  const res = await apiClient.post<ApiResponse<QuickRemissionGuide>>(
    `/document/quick-remission-guide/${id}/send`,
    { ruc },
  )
  return res.data.data
}

export async function downloadRide(accessKey: string, ruc: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/document/${accessKey}/ride`, {
    params: { ruc },
    responseType: 'blob',
  })
  return res.data
}

export interface AuthorizedDocumentLookup {
  cod_doc_sustento: string
  num_doc_sustento: string
  num_aut_doc_sustento: string
  fecha_emision_doc_sustento: string
}

export async function lookupAuthorizedDocument(
  ruc: string,
  series: string,
  sequential: string,
): Promise<AuthorizedDocumentLookup> {
  const res = await apiClient.get<ApiResponse<AuthorizedDocumentLookup>>(
    '/document/quick-remission-guides/lookup-authorized-document',
    { params: { ruc, series, sequential } },
  )
  return res.data.data
}
