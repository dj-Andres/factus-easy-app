import { useQuery } from '@tanstack/react-query'
import { getRetentionConfigs } from '../api/retentionConfigs'

export function useRetentionConfigs() {
  return useQuery({
    queryKey: ['retention-configs'],
    queryFn: getRetentionConfigs,
    staleTime: Infinity,
  })
}
