import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuickInvoice,
  getQuickInvoice,
  getQuickInvoices,
  sendQuickInvoice,
  updateQuickInvoice,
} from '../api/quickInvoices'
import type { QuickInvoiceInput } from '../types/api'

export interface QuickInvoiceListQuery {
  ruc: string | null
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
}

export function useQuickInvoices(params: QuickInvoiceListQuery) {
  return useQuery({
    queryKey: ['quick-invoices', params],
    queryFn: () =>
      getQuickInvoices({
        ruc: params.ruc!,
        search: params.search || undefined,
        status: params.status || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        page: params.page ?? 1,
        per_page: 15,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useQuickInvoice(ruc: string | null, id: number | null) {
  return useQuery({
    queryKey: ['quick-invoices', 'detail', id],
    queryFn: () => getQuickInvoice(ruc!, id!),
    enabled: !!ruc && !!id,
  })
}

export function useCreateQuickInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuickInvoiceInput) => createQuickInvoice(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-invoices'] }),
  })
}

export function useUpdateQuickInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuickInvoiceInput }) => updateQuickInvoice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-invoices'] }),
  })
}

export function useSendQuickInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ruc }: { id: number; ruc: string }) => sendQuickInvoice(id, ruc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-invoices'] }),
  })
}
