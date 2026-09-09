import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuickRetention,
  getQuickRetention,
  getQuickRetentions,
  sendQuickRetention,
  updateQuickRetention,
} from '../api/quickRetentions'
import type { QuickRetentionInput } from '../types/api'

export interface QuickRetentionListQuery {
  ruc: string | null
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
}

export function useQuickRetentions(params: QuickRetentionListQuery) {
  return useQuery({
    queryKey: ['quick-retentions', params],
    queryFn: () =>
      getQuickRetentions({
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

export function useQuickRetention(ruc: string | null, id: number | null) {
  return useQuery({
    queryKey: ['quick-retentions', 'detail', id],
    queryFn: () => getQuickRetention(ruc!, id!),
    enabled: !!ruc && !!id,
  })
}

export function useCreateQuickRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuickRetentionInput) => createQuickRetention(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-retentions'] }),
  })
}

export function useUpdateQuickRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuickRetentionInput }) => updateQuickRetention(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-retentions'] }),
  })
}

export function useSendQuickRetention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ruc }: { id: number; ruc: string }) => sendQuickRetention(id, ruc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-retentions'] }),
  })
}