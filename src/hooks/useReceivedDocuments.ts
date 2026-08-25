import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getReceivedDocuments, uploadReceivedDocuments } from '../api/receivedDocuments'

export interface ReceivedDocumentsParams {
  ruc: string | null
  sriDocumentCode?: string
  issuerRuc?: string
  accessKey?: string
  issuedFrom?: string
  issuedTo?: string
  page?: number
}

export function useReceivedDocuments(params: ReceivedDocumentsParams) {
  return useQuery({
    queryKey: ['received-documents', params],
    queryFn: () =>
      getReceivedDocuments({
        ruc: params.ruc!,
        sri_document_code: params.sriDocumentCode || undefined,
        issuer_ruc: params.issuerRuc || undefined,
        access_key: params.accessKey || undefined,
        issued_from: params.issuedFrom || undefined,
        issued_to: params.issuedTo || undefined,
        page: params.page ?? 1,
        per_page: 20,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useUploadReceivedDocuments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ruc, file }: { ruc: string; file: File }) => uploadReceivedDocuments(ruc, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['received-documents'] }),
  })
}
