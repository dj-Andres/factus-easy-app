import { apiClient } from './client'
import type { ApiResponse, LaravelPagination, QuickInvoice, QuickInvoiceInput } from '../types/api'

export interface QuickInvoiceListParams {
  ruc: string
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
  per_page?: number
}

export async function getQuickInvoices(params: QuickInvoiceListParams): Promise<LaravelPagination<QuickInvoice>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<QuickInvoice>>>('/document/quick-invoices', {
    params,
  })
  return res.data.data
}

export async function getQuickInvoice(ruc: string, id: number): Promise<QuickInvoice> {
  const res = await apiClient.get<ApiResponse<QuickInvoice>>(`/document/quick-invoices/${id}`, { params: { ruc } })
  return res.data.data
}

export async function createQuickInvoice(data: QuickInvoiceInput): Promise<QuickInvoice> {
  const res = await apiClient.post<ApiResponse<QuickInvoice>>('/document/quick-invoice', data)
  return res.data.data
}

export async function updateQuickInvoice(id: number, data: QuickInvoiceInput): Promise<QuickInvoice> {
  const res = await apiClient.put<ApiResponse<QuickInvoice>>(`/document/quick-invoice/${id}`, data)
  return res.data.data
}

export async function sendQuickInvoice(id: number, ruc: string): Promise<QuickInvoice> {
  const res = await apiClient.post<ApiResponse<QuickInvoice>>(`/document/quick-invoice/${id}/send`, { ruc })
  return res.data.data
}

export async function downloadRide(accessKey: string, ruc: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/document/${accessKey}/ride`, {
    params: { ruc },
    responseType: 'blob',
  })
  return res.data
}
