import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../api/customers'
import type { CustomerInput } from '../types/api'

export interface CustomerListQuery {
  ruc: string | null
  search?: string
  page?: number
}

export function useCustomers(params: CustomerListQuery) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () =>
      getCustomers({
        ruc: params.ruc!,
        search: params.search || undefined,
        page: params.page ?? 1,
        per_page: 15,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerInput) => createCustomer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerInput }) => updateCustomer(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })
}
