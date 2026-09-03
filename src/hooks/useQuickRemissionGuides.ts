import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuickRemissionGuide,
  getQuickRemissionGuide,
  getQuickRemissionGuides,
  sendQuickRemissionGuide,
  updateQuickRemissionGuide,
} from '../api/quickRemissionGuides'
import type { QuickRemissionGuideInput } from '../types/api'

export interface QuickRemissionGuideListQuery {
  ruc: string | null
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
}

export function useQuickRemissionGuides(params: QuickRemissionGuideListQuery) {
  return useQuery({
    queryKey: ['quick-remission-guides', params],
    queryFn: () =>
      getQuickRemissionGuides({
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

export function useQuickRemissionGuide(ruc: string | null, id: number | null) {
  return useQuery({
    queryKey: ['quick-remission-guides', 'detail', id],
    queryFn: () => getQuickRemissionGuide(ruc!, id!),
    enabled: !!ruc && !!id,
  })
}

export function useCreateQuickRemissionGuide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuickRemissionGuideInput) => createQuickRemissionGuide(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-remission-guides'] }),
  })
}

export function useUpdateQuickRemissionGuide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuickRemissionGuideInput }) =>
      updateQuickRemissionGuide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-remission-guides'] }),
  })
}

export function useSendQuickRemissionGuide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ruc }: { id: number; ruc: string }) => sendQuickRemissionGuide(id, ruc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-remission-guides'] }),
  })
}
