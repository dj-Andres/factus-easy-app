import { apiClient } from './client'
import type { ApiResponse, Company } from '../types/api'

export interface CompanyUpdatePayload {
  ruc: string
  name: string
  business_name: string
  address: string
  phone: string
  accounting_required: 'YES' | 'NO'
  special_taxpayer: 'YES' | 'NO'
  special_taxpayer_number?: string
  large_taxpayer?: 'YES' | 'NO' | null
  major_taxpayer: 'YES' | 'NO'
  sri_resolution_code?: string
  email: string
}

export async function updateCompany(ruc: string, data: CompanyUpdatePayload): Promise<Company> {
  const res = await apiClient.put<ApiResponse<Company>>(`/companie/update/${ruc}`, data)
  return res.data.data
}

export async function createCompany(data: CompanyUpdatePayload): Promise<Company> {
  const res = await apiClient.post<ApiResponse<Company>>('/companie/register', data)
  return res.data.data
}

export async function uploadCertificate(ruc: string, file: File, password: string): Promise<Company> {
  const formData = new FormData()
  formData.append('ruc', ruc)
  formData.append('certify', file)
  formData.append('password', password)
  const res = await apiClient.post<ApiResponse<Company>>('/companie/certificate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export async function uploadLogo(ruc: string, file: File): Promise<Company> {
  const formData = new FormData()
  formData.append('ruc', ruc)
  formData.append('logo', file)
  const res = await apiClient.post<ApiResponse<Company>>('/companie/upload/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}
