import { useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useReceivedDocuments, useUploadReceivedDocuments } from '../../hooks/useReceivedDocuments'
import { downloadReceivedRide, downloadReceivedXml } from '../../api/receivedDocuments'
import { toErrorMessage } from '../../lib/errors'
import { DOCUMENT_TYPE_LABELS, formatDate, formatPrice } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import TablePagination from '../../components/ui/TablePagination'
import SortableTh from '../../components/ui/SortableTh'
import { useColumnSort } from '../../hooks/useColumnSort'
import type { ReceivedDocument } from '../../types/api'

export default function ReceivedDocumentsPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [file, setFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<string | null>(null)

  const [sriDocumentCode, setSriDocumentCode] = useState('')
  const [issuerRuc, setIssuerRuc] = useState('')
  const [issuedFrom, setIssuedFrom] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  })
  const [issuedTo, setIssuedTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [page, setPage] = useState(1)

  const uploadMutation = useUploadReceivedDocuments()
  const { data, isPending, isFetching, error, refetch } = useReceivedDocuments({
    ruc: selectedRuc,
    sriDocumentCode: sriDocumentCode || undefined,
    issuerRuc: issuerRuc || undefined,
    issuedFrom: issuedFrom || undefined,
    issuedTo: issuedTo || undefined,
    page,
  })

  const documents = data?.documents ?? []
  const lastPage = data?.pagination.last_page ?? 1
  const total = data?.pagination.total ?? 0

  const sortValue = (doc: ReceivedDocument, key: string): string | number | null | undefined => {
    switch (key) {
      case 'issuer':
        return doc.issuer_business_name ?? doc.issuer_ruc
      case 'type':
        return doc.sri_document_code
      case 'accessKey':
        return doc.access_key
      case 'date':
        return doc.issued_on ?? ''
      case 'total':
        return doc.total_amount ?? 0
      default:
        return undefined
    }
  }
  const { sortedRows: sortedDocuments, toggle: toggleSort, reset: resetSort, indicator } = useColumnSort(
    documents,
    sortValue,
  )

  const handleUpload = () => {
    if (!selectedRuc || !file) return
    setUploadError(null)
    setUploaded(null)
    uploadMutation.mutate(
      { ruc: selectedRuc, file },
      {
        onSuccess: (result) => {
          setFile(null)
          setUploaded(`Archivo "${result.original_filename}" subido. Se procesará en segundo plano.`)
        },
        onError: (err) => setUploadError(toErrorMessage(err)),
      },
    )
  }

  const handleDownload = async (doc: ReceivedDocument, kind: 'xml' | 'ride') => {
    if (!selectedRuc) return
    try {
      if (kind === 'xml') await downloadReceivedXml(selectedRuc, doc.access_key)
      else await downloadReceivedRide(selectedRuc, doc.access_key)
    } catch {
      // ignored
    }
  }

  const inputClass =
    'rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Documentos Recibidos</h1>
        <p className="mt-1 text-sm text-muted">Comprobantes emitidos por tus proveedores ({total})</p>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-ink">Subir archivo TXT</h2>
        <p className="mt-1 text-[13px] text-muted">
          Sube el archivo TXT con las claves de acceso proporcionadas por el SRI.
        </p>

        {uploadError && (
          <Alert color="red" className="mt-4" onDismiss={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}
        {uploaded && (
          <Alert color="green" className="mt-4" onDismiss={() => setUploaded(null)}>
            {uploaded}
          </Alert>
        )}

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-accent-hover"
            />
          </div>
          <Button color="blue" onClick={handleUpload} disabled={uploadMutation.isPending || !file}>
            {uploadMutation.isPending && <Spinner size="sm" className="mr-2" />}
            Subir
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-warm p-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-1 text-[12px] text-faint">Tipo</div>
            <select
              value={sriDocumentCode}
              onChange={(e) => {
                setSriDocumentCode(e.target.value)
                setPage(1)
                resetSort()
              }}
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="01">Factura</option>
              <option value="04">Nota de Crédito</option>
              <option value="06">Guía de Remisión</option>
              <option value="07">Retención</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-faint">RUC emisor</div>
            <input
              type="text"
              value={issuerRuc}
              onChange={(e) => {
                setIssuerRuc(e.target.value)
                setPage(1)
                resetSort()
              }}
              placeholder="13 dígitos"
              className={inputClass}
            />
          </div>
          <div>
            <div className="mb-1 text-[12px] text-faint">Desde</div>
            <input
              type="date"
              value={issuedFrom}
              onChange={(e) => {
                setIssuedFrom(e.target.value)
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
              value={issuedTo}
              onChange={(e) => {
                setIssuedTo(e.target.value)
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
              No se pudieron cargar los documentos recibidos
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-sm text-faint">No hay documentos recibidos</div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <SortableTh label="Emisor" onClick={() => toggleSort('issuer')} indicator={indicator('issuer')} />
                  <SortableTh label="Tipo" onClick={() => toggleSort('type')} indicator={indicator('type')} />
                  <SortableTh label="Clave de acceso" onClick={() => toggleSort('accessKey')} indicator={indicator('accessKey')} />
                  <SortableTh label="Fecha" onClick={() => toggleSort('date')} indicator={indicator('date')} />
                  <SortableTh label="Total" onClick={() => toggleSort('total')} indicator={indicator('total')} />
                  <TableHeadCell className="text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDocuments.map((doc) => (
                  <TableRow key={doc.id} className="bg-surface">
                    <TableCell>
                      <div className="text-[13px] font-medium text-ink">{doc.issuer_business_name ?? doc.issuer_ruc}</div>
                      <div className="font-mono text-[11px] text-faint">{doc.issuer_ruc}</div>
                    </TableCell>
                    <TableCell>
                      <Badge tone={doc.sri_document_code === '01' ? 'violet' : 'blue'}>
                        {DOCUMENT_TYPE_LABELS[doc.sri_document_code] ?? doc.sri_document_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted">
                      {doc.access_key.slice(0, 24)}...
                    </TableCell>
                    <TableCell className="text-muted">{formatDate(doc.issued_on)}</TableCell>
                    <TableCell className="font-mono text-[13px] text-ink">
                      {formatPrice(doc.total_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {doc.has_xml && (
                          <button
                            type="button"
                            onClick={() => handleDownload(doc, 'xml')}
                            className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                          >
                            XML
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(doc, 'ride')}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                        >
                          RIDE
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
          <TablePagination page={page} lastPage={lastPage} onPageChange={(p) => setPage(p)} />
        )}
      </div>
    </div>
  )
}
