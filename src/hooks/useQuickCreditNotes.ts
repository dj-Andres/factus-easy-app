import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createQuickCreditNote,
  getQuickCreditNote,
  getQuickCreditNotes,
  lookupOriginalInvoice,
  sendQuickCreditNote,
  updateQuickCreditNote,
} from '../api/quickCreditNotes'
import type { QuickCreditNoteInput } from '../types/api'

export interface QuickCreditNoteListQuery {
  ruc: string | null
  search?: string
  status?: string
  from?: string
  to?: string
  page?: number
}

export function useQuickCreditNotes(params: QuickCreditNoteListQuery) {
  return useQuery({
    queryKey: ['quick-credit-notes', params],
    queryFn: () =>
      getQuickCreditNotes({
        ruc: params.ruc!,
        search: params.search || undefined,
        status: params.status || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        page: params.page ?? 1,
        per_page: 15,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useQuickCreditNote(ruc: string | null, id: number | null) {
  return useQuery({
    queryKey: ['quick-credit-notes', 'detail', id],
    queryFn: () => getQuickCreditNote(ruc!, id!),
    enabled: !!ruc && !!id,
  })
}

export function useLookupOriginalInvoice(
  ruc: string | null,
  series: string,
  sequential: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['quick-credit-notes', 'lookup-invoice', ruc, series, sequential],
    queryFn: () => lookupOriginalInvoice(ruc!, series, sequential),
    enabled: !!ruc && enabled && series.trim() !== '' && sequential.trim() !== '',
    retry: false,
  })
}

export function useCreateQuickCreditNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuickCreditNoteInput) => createQuickCreditNote(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-credit-notes'] }),
  })
}

export function useUpdateQuickCreditNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuickCreditNoteInput }) =>
      updateQuickCreditNote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-credit-notes'] }),
  })
}

export function useSendQuickCreditNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ruc }: { id: number; ruc: string }) => sendQuickCreditNote(id, ruc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-credit-notes'] }),
  })
}
