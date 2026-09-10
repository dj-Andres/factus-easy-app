import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../api/dashboard'
import type { DashboardStatsResult } from '../types/api'

export function useDashboardStats(ruc: string | null) {
  return useQuery<DashboardStatsResult>({
    queryKey: ['dashboard', 'stats', ruc],
    queryFn: () => getDashboardStats(ruc!),
    enabled: !!ruc,
  })
}