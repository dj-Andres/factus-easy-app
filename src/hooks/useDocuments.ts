import { useQuery } from '@tanstack/react-query'
import { getDocumentStatus } from '../api/documents'
import type { DocumentStatusCode, DocumentTypeCode } from '../types/api'

export interface DocumentStatusParams {
  ruc: string | null
  tipo?: DocumentTypeCode
  status?: DocumentStatusCode
  dateFrom?: string
  dateTo?: string
  page?: number
}

export function useDocumentStatus(params: DocumentStatusParams) {
  return useQuery({
    queryKey: ['documents', 'status', params],
    queryFn: () =>
      getDocumentStatus({
        ruc: params.ruc!,
        tipo: params.tipo,
        status: params.status,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
        page: params.page ?? 1,
        per_page: 20,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}
