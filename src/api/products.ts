import { apiClient } from './client'
import type { ApiResponse, LaravelPagination, Product, ProductInput, ProductOptions } from '../types/api'

export interface ProductListParams {
  ruc: string
  search?: string
  page?: number
  per_page?: number
  product_kind?: string
  sri_product_type?: string
}

export async function getProducts(params: ProductListParams): Promise<LaravelPagination<Product>> {
  const res = await apiClient.get<ApiResponse<LaravelPagination<Product>>>('/products', { params })
  return res.data.data
}

export async function getProductOptions(): Promise<ProductOptions> {
  const res = await apiClient.get<ApiResponse<ProductOptions>>('/products/options')
  return res.data.data
}

export async function getProduct(ruc: string, id: number): Promise<Product> {
  const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`, { params: { ruc } })
  return res.data.data
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const res = await apiClient.post<ApiResponse<Product>>('/products', data)
  return res.data.data
}

export async function updateProduct(id: number, data: ProductInput): Promise<Product> {
  const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
  return res.data.data
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
