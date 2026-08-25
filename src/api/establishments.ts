import { apiClient } from './client'
import type { ApiResponse, CompanyEstablishment, CompanyEstablishmentInput } from '../types/api'

export async function getEstablishments(ruc: string): Promise<CompanyEstablishment[]> {
  const res = await apiClient.get<ApiResponse<CompanyEstablishment[]>>(`/companie/${ruc}/establishments`)
  return res.data.data
}

export async function createEstablishment(
  ruc: string,
  data: CompanyEstablishmentInput,
): Promise<CompanyEstablishment> {
  const res = await apiClient.post<ApiResponse<CompanyEstablishment>>(`/companie/${ruc}/establishments`, data)
  return res.data.data
}

export async function updateEstablishment(
  ruc: string,
  id: number,
  data: CompanyEstablishmentInput,
): Promise<CompanyEstablishment> {
  const res = await apiClient.put<ApiResponse<CompanyEstablishment>>(`/companie/${ruc}/establishments/${id}`, data)
  return res.data.data
}

export async function toggleEstablishmentStatus(ruc: string, id: number): Promise<CompanyEstablishment> {
  const res = await apiClient.patch<ApiResponse<CompanyEstablishment>>(`/companie/${ruc}/establishments/${id}/toggle-status`)
  return res.data.data
}
