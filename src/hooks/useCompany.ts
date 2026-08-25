import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useCompanies } from './useCompanyConfig'

export function useCompany() {
  const selectedRuc = useAuthStore((s) => s.selectedRuc)
  const setSelectedRuc = useAuthStore((s) => s.setSelectedRuc)

  const query = useCompanies()
  const companies = query.data ?? []

  useEffect(() => {
    if (query.isPending || !query.data || query.data.length === 0) return
    const current = useAuthStore.getState().selectedRuc
    if (!current || !query.data.some((c) => c.ruc === current)) {
      setSelectedRuc(query.data[0].ruc)
    }
  }, [query.data, query.isPending, setSelectedRuc])

  const selectedCompany = companies.find((c) => c.ruc === selectedRuc) ?? null

  return {
    companies,
    selectedCompany,
    selectedRuc,
    setSelectedRuc,
    isLoading: query.isPending,
    error: query.error ? 'No se pudieron cargar las empresas' : null,
    refetch: query.refetch,
  }
}
