import { apiClient } from './client'
import type { ApiResponse, CompanyEmissionPoint, CompanyEmissionPointInput } from '../types/api'

export async function getEmissionPoints(ruc: string, establishmentId?: number): Promise<CompanyEmissionPoint[]> {
  const res = await apiClient.get<ApiResponse<CompanyEmissionPoint[]>>(`/companie/${ruc}/emission-points`, {
    params: establishmentId ? { establishment_id: establishmentId } : undefined,
  })
  return res.data.data
}

export async function createEmissionPoint(
  ruc: string,
  data: CompanyEmissionPointInput,
): Promise<CompanyEmissionPoint> {
  const res = await apiClient.post<ApiResponse<CompanyEmissionPoint>>(`/companie/${ruc}/emission-points`, data)
  return res.data.data
}

export async function updateEmissionPoint(
  ruc: string,
  id: number,
  data: CompanyEmissionPointInput,
): Promise<CompanyEmissionPoint> {
  const res = await apiClient.put<ApiResponse<CompanyEmissionPoint>>(`/companie/${ruc}/emission-points/${id}`, data)
  return res.data.data
}

export async function updateEmissionPointSequential(
  ruc: string,
  id: number,
  sequential: number,
): Promise<CompanyEmissionPoint> {
  const res = await apiClient.patch<ApiResponse<CompanyEmissionPoint>>(
    `/companie/${ruc}/emission-points/${id}/sequential`,
    { sequential },
  )
  return res.data.data
}

export async function toggleEmissionPointStatus(ruc: string, id: number): Promise<CompanyEmissionPoint> {
  const res = await apiClient.patch<ApiResponse<CompanyEmissionPoint>>(`/companie/${ruc}/emission-points/${id}/toggle-status`)
  return res.data.data
}
