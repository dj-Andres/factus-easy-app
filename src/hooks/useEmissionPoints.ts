import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEmissionPoint,
  getEmissionPoints,
  toggleEmissionPointStatus,
  updateEmissionPoint,
  updateEmissionPointSequential,
} from '../api/emissionPoints'
import type { CompanyEmissionPointInput } from '../types/api'

export function useEmissionPoints(ruc: string | null, establishmentId?: number) {
  return useQuery({
    queryKey: ['emission-points', ruc, establishmentId ?? null],
    queryFn: () => getEmissionPoints(ruc!, establishmentId),
    enabled: !!ruc,
  })
}

export function useCreateEmissionPoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, data }: { ruc: string; data: CompanyEmissionPointInput }) =>
      createEmissionPoint(ruc, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emission-points'] }),
  })
}

export function useUpdateEmissionPoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, id, data }: { ruc: string; id: number; data: CompanyEmissionPointInput }) =>
      updateEmissionPoint(ruc, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emission-points'] }),
  })
}

export function useUpdateEmissionPointSequential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, id, sequential }: { ruc: string; id: number; sequential: number }) =>
      updateEmissionPointSequential(ruc, id, sequential),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emission-points'] }),
  })
}

export function useToggleEmissionPoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, id }: { ruc: string; id: number }) => toggleEmissionPointStatus(ruc, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emission-points'] }),
  })
}
