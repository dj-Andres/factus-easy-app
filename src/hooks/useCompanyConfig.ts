import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCompanies } from '../api/companies'
import { createCompany, updateCompany, uploadCertificate, uploadLogo, type CompanyUpdatePayload } from '../api/company'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: getCompanies,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyUpdatePayload) => createCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, data }: { ruc: string; data: CompanyUpdatePayload }) => updateCompany(ruc, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useUploadCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, file, password }: { ruc: string; file: File; password: string }) =>
      uploadCertificate(ruc, file, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, file }: { ruc: string; file: File }) => uploadLogo(ruc, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}
