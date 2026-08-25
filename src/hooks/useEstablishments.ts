import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEstablishment,
  getEstablishments,
  toggleEstablishmentStatus,
  updateEstablishment,
} from '../api/establishments'
import type { CompanyEstablishmentInput } from '../types/api'

export function useEstablishments(ruc: string | null) {
  return useQuery({
    queryKey: ['establishments', ruc],
    queryFn: () => getEstablishments(ruc!),
    enabled: !!ruc,
  })
}

export function useCreateEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, data }: { ruc: string; data: CompanyEstablishmentInput }) =>
      createEstablishment(ruc, data),
    onSuccess: (_data, { ruc }) => queryClient.invalidateQueries({ queryKey: ['establishments', ruc] }),
  })
}

export function useUpdateEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, id, data }: { ruc: string; id: number; data: CompanyEstablishmentInput }) =>
      updateEstablishment(ruc, id, data),
    onSuccess: (_data, { ruc }) => queryClient.invalidateQueries({ queryKey: ['establishments', ruc] }),
  })
}

export function useToggleEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, id }: { ruc: string; id: number }) => toggleEstablishmentStatus(ruc, id),
    onSuccess: (_data, { ruc }) => queryClient.invalidateQueries({ queryKey: ['establishments', ruc] }),
  })
}
