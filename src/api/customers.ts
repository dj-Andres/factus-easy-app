import { apiClient } from './client'
import type { ApiResponse, Customer, CustomerInput, LaravelPagination } from '../types/api'

export async function getCustomers(params: {
  ruc: string
  search?: string
  page?: number
  per_page?: number
}): Promise<LaravelPagination<Customer>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<Customer>>>('/customers', { params })
  return res.data.data
}

export async function getCustomer(ruc: string, id: number): Promise<Customer> {
  const res = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`, { params: { ruc } })
  return res.data.data
}

export async function createCustomer(data: CustomerInput): Promise<Customer> {
  const res = await apiClient.post<ApiResponse<Customer>>('/customers', data)
  return res.data.data
}

export async function updateCustomer(id: number, data: CustomerInput): Promise<Customer> {
  const res = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data)
  return res.data.data
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`)
}
