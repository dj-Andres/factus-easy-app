import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransporter, deleteTransporter, getTransporters, updateTransporter } from '../api/transporters'
import type { TransporterInput } from '../types/api'

export interface TransporterListQuery {
  ruc: string | null
  search?: string
  page?: number
}

export function useTransporters(params: TransporterListQuery) {
  return useQuery({
    queryKey: ['transporters', params],
    queryFn: () =>
      getTransporters({
        ruc: params.ruc!,
        search: params.search || undefined,
        page: params.page ?? 1,
        per_page: 15,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateTransporter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TransporterInput) => createTransporter(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transporters'] }),
  })
}

export function useUpdateTransporter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransporterInput }) => updateTransporter(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transporters'] }),
  })
}

export function useDeleteTransporter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTransporter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transporters'] }),
  })
}
