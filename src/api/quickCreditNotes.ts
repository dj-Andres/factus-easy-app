import { apiClient } from './client'
import type {
  ApiResponse,
  LaravelPagination,
  QuickCreditNote,
  QuickCreditNoteInput,
  QuickInvoice,
} from '../types/api'

export interface QuickCreditNoteListParams {
  ruc: string
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export async function getQuickCreditNotes(
  params: QuickCreditNoteListParams,
): Promise<LaravelPagination<QuickCreditNote>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<QuickCreditNote>>>(
    '/document/quick-credit-notes',
    { params },
  )
  return res.data.data
}

export async function getQuickCreditNote(ruc: string, id: number): Promise<QuickCreditNote> {
  const res = await apiClient.get<ApiResponse<QuickCreditNote>>(`/document/quick-credit-notes/${id}`, {
    params: { ruc },
  })
  return res.data.data
}

export async function lookupOriginalInvoice(
  ruc: string,
  series: string,
  sequential: string,
): Promise<QuickInvoice> {
  const res = await apiClient.get<ApiResponse<QuickInvoice>>('/document/quick-credit-notes/lookup-invoice', {
    params: { ruc, series, sequential },
  })
  return res.data.data
}

export async function createQuickCreditNote(data: QuickCreditNoteInput): Promise<QuickCreditNote> {
  const res = await apiClient.post<ApiResponse<QuickCreditNote>>('/document/quick-credit-note', data)
  return res.data.data
}

export async function updateQuickCreditNote(id: number, data: QuickCreditNoteInput): Promise<QuickCreditNote> {
  const res = await apiClient.put<ApiResponse<QuickCreditNote>>(`/document/quick-credit-note/${id}`, data)
  return res.data.data
}

export async function sendQuickCreditNote(id: number, ruc: string): Promise<QuickCreditNote> {
  const res = await apiClient.post<ApiResponse<QuickCreditNote>>(`/document/quick-credit-note/${id}/send`, {
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
