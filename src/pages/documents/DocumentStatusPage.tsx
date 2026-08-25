import { useState } from 'react'
import { Alert, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useDocumentStatus } from '../../hooks/useDocuments'
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatDate,
  statusBadgeClass,
} from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import type { DocumentStatus, DocumentStatusCode, DocumentTypeCode } from '../../types/api'
import DocumentDetailModal from './DocumentDetailModal'

const STATUSES: DocumentStatusCode[] = [
  'GENERATED',
  'SIGNED',
  'RECEIVED',
  'AUTHORIZED',
  'REJECTED',
  'ERROR',
  'RETURNED',
]

export default function DocumentStatusPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [tipo, setTipo] = useState<DocumentTypeCode | ''>('')
  const [status, setStatus] = useState<DocumentStatusCode | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<DocumentStatus | null>(null)

  const { data, isPending, isFetching, error, refetch } = useDocumentStatus({
    ruc: selectedRuc,
    tipo: tipo || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
  })

  const documents = data?.documents ?? []
  const summary = data?.summary
  const pagination = data?.pagination
  const lastPage = pagination?.last_page ?? 1

  const selectClass =
    'rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
  const inputClass =
    'rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Documentos</h1>
        <p className="mt-1 text-sm text-muted">Estado de comprobantes emitidos</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border-warm bg-surface p-4 shadow-card">
            <div className="text-[12px] text-muted">Total</div>
            <div className="mt-1 font-mono text-xl font-semibold text-ink">{summary.total_documents}</div>
          </div>
          <div className="rounded-lg border border-border-warm bg-surface p-4 shadow-card">
            <div className="text-[12px] text-muted">Autorizados</div>
            <div className="mt-1 font-mono text-xl font-semibold text-success">
              {summary.by_status.AUTHORIZED ?? 0}
            </div>
          </div>
          <div className="rounded-lg border border-border-warm bg-surface p-4 shadow-card">
            <div className="text-[12px] text-muted">En proceso</div>
            <div className="mt-1 font-mono text-xl font-semibold text-warning">
              {summary.processing_documents}
            </div>
          </div>
          <div className="rounded-lg border border-border-warm bg-surface p-4 shadow-card">
            <div className="text-[12px] text-muted">Finalizados</div>
            <div className="mt-1 font-mono text-xl font-semibold text-ink">
              {summary.finalized_documents}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-warm p-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-1 text-[12px] text-faint">Tipo</div>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as DocumentTypeCode | '')
                setPage(1)
              }}
              className={selectClass}
            >
              <option value="">Todos</option>
              <option value="01">Factura</option>
              <option value="04">Nota de Crédito</option>
              <option value="06">Guía de Remisión</option>
              <option value="07">Retención</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-faint">Estado</div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as DocumentStatusCode | '')
                setPage(1)
              }}
              className={selectClass}
            >
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DOCUMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-faint">Desde</div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
              className={inputClass}
            />
          </div>
          <div>
            <div className="mb-1 text-[12px] text-faint">Hasta</div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar los documentos
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-sm text-faint">No hay documentos</div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Serie</TableHeadCell>
                  <TableHeadCell>Fecha</TableHeadCell>
                  <TableHeadCell>Estado</TableHeadCell>
                  <TableHeadCell>Autorización</TableHeadCell>
                  <TableHeadCell className="text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="bg-surface">
                    <TableCell>
                      <Badge tone={doc.document_type === '01' ? 'violet' : 'blue'}>
                        {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-ink">
                      {doc.series}-{doc.sequential}
                    </TableCell>
                    <TableCell className="text-muted">{formatDate(doc.issue_date)}</TableCell>
                    <TableCell>
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(doc.status)}`}>
                        {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[12px] text-muted">
                      {doc.authorization_number ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelected(doc)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                        >
                          Ver detalle
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isPending && documents.length > 0 && (
          <div className="flex items-center justify-between border-t border-border-warm px-4 py-3">
            <span className="text-[12px] text-faint">
              Página {page} de {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-border-warm px-3 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-border-warm px-3 py-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <DocumentDetailModal document={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
