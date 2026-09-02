import { useState } from 'react'
import {
  Alert,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useDocumentStatus } from '../../hooks/useDocuments'
import { downloadDocumentRide, downloadDocumentXml } from '../../api/documents'
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatDate,
  statusBadgeClass,
} from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import TablePagination from '../../components/ui/TablePagination'
import SortableTh from '../../components/ui/SortableTh'
import { useColumnSort } from '../../hooks/useColumnSort'
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

async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function DocumentStatusPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [tipo, setTipo] = useState<DocumentTypeCode | ''>('')
  const [status, setStatus] = useState<DocumentStatusCode | ''>('')
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<DocumentStatus | null>(null)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)

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

  const sortValue = (doc: DocumentStatus, key: string): string | number | null | undefined => {
    switch (key) {
      case 'type':
        return doc.document_type
      case 'series':
        return `${doc.series}-${doc.sequential}`
      case 'date':
        return doc.issue_date ?? ''
      case 'status':
        return doc.status
      case 'authorization':
        return doc.authorization_number ?? ''
      default:
        return undefined
    }
  }
  const { sortedRows: sortedDocs, toggle: handleSort, reset: resetSort, indicator } = useColumnSort(
    documents,
    sortValue,
  )

  const handleDownload = async (doc: DocumentStatus, kind: 'ride' | 'xml') => {
    if (!selectedRuc || !doc.access_key) return
    const key = `${kind}-${doc.access_key}`
    setDownloadingKey(key)
    try {
      const blob = kind === 'ride'
        ? await downloadDocumentRide(doc.access_key, selectedRuc)
        : await downloadDocumentXml(doc.access_key, selectedRuc)
      const ext = kind === 'ride' ? 'pdf' : 'xml'
      await downloadBlob(blob, `${kind.toUpperCase()}_${doc.access_key}.${ext}`)
    } finally {
      setDownloadingKey(null)
    }
  }

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
                resetSort()
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
                resetSort()
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
                resetSort()
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
                resetSort()
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
                  <SortableTh label="Tipo" onClick={() => handleSort('type')} indicator={indicator('type')} />
                  <SortableTh label="Serie" onClick={() => handleSort('series')} indicator={indicator('series')} />
                  <SortableTh label="Fecha" onClick={() => handleSort('date')} indicator={indicator('date')} />
                  <SortableTh label="Estado" onClick={() => handleSort('status')} indicator={indicator('status')} />
                  <SortableTh label="Autorización" onClick={() => handleSort('authorization')} indicator={indicator('authorization')} />
                  <TableHeadCell className="text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDocs.map((doc) => (
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
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(doc)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                        >
                          Ver detalle
                        </button>
                        {doc.access_key && (
                          <>
                            {doc.status === 'AUTHORIZED' && (
                              <button
                                type="button"
                                disabled={downloadingKey === `ride-${doc.access_key}`}
                                onClick={() => handleDownload(doc, 'ride')}
                                className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:opacity-50"
                              >
                                {downloadingKey === `ride-${doc.access_key}` ? 'Descargando…' : 'RIDE'}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={downloadingKey === `xml-${doc.access_key}`}
                              onClick={() => handleDownload(doc, 'xml')}
                              className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2 disabled:opacity-50"
                            >
                              {downloadingKey === `xml-${doc.access_key}` ? 'Descargando…' : 'XML'}
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isPending && documents.length > 0 && (
          <TablePagination page={page} lastPage={lastPage} onPageChange={(p) => setPage(p)} />
        )}
      </div>

      <DocumentDetailModal document={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
