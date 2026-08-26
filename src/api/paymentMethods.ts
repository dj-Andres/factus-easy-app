import { apiClient } from './client'
import type { ApiResponse, PaymentMethod } from '../types/api'

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await apiClient.get<ApiResponse<PaymentMethod[]>>('/payment-methods/list')
  return res.data.data
}
