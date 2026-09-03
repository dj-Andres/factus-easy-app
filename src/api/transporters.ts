import { apiClient } from './client'
import type { ApiResponse, LaravelPagination, Transporter, TransporterInput } from '../types/api'

export async function getTransporters(params: {
  ruc: string
  search?: string
  page?: number
  per_page?: number
}): Promise<LaravelPagination<Transporter>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<Transporter>>>('/transporters', { params })
  return res.data.data
}

export async function getTransporter(ruc: string, id: number): Promise<Transporter> {
  const res = await apiClient.get<ApiResponse<Transporter>>(`/transporters/${id}`, { params: { ruc } })
  return res.data.data
}

export async function createTransporter(data: TransporterInput): Promise<Transporter> {
  const res = await apiClient.post<ApiResponse<Transporter>>('/transporters', data)
  return res.data.data
}

export async function updateTransporter(id: number, data: TransporterInput): Promise<Transporter> {
  const res = await apiClient.put<ApiResponse<Transporter>>(`/transporters/${id}`, data)
  return res.data.data
}

export async function deleteTransporter(id: number): Promise<void> {
  await apiClient.delete(`/transporters/${id}`)
}
