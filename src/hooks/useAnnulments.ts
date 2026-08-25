import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAnnulmentStatus, listAnnulments, requestAnnulment } from '../api/annulments'
import type { AnnulmentRequestInput } from '../types/api'

export function useAnnulmentList(accessKey: string | null) {
  return useQuery({
    queryKey: ['annulments', accessKey],
    queryFn: () => listAnnulments(accessKey!),
    enabled: !!accessKey,
  })
}

export function useAnnulmentStatus(accessKey: string | null) {
  return useQuery({
    queryKey: ['annulments', accessKey, 'status'],
    queryFn: () => getAnnulmentStatus(accessKey!),
    enabled: !!accessKey,
  })
}

export function useRequestAnnulment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ accessKey, data }: { accessKey: string; data: AnnulmentRequestInput }) =>
      requestAnnulment(accessKey, data),
    onSuccess: (_data, { accessKey }) => {
      queryClient.invalidateQueries({ queryKey: ['annulments', accessKey] })
      queryClient.invalidateQueries({ queryKey: ['documents', 'status'] })
    },
  })
}
