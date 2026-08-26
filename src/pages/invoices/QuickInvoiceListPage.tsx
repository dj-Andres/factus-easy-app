import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useQuickInvoices, useSendQuickInvoice } from '../../hooks/useQuickInvoices'
import { quickInvoiceStatusLabel, quickInvoiceStatusTone } from '../../lib/quickInvoices'
import { formatDate, formatPrice } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import QuickInvoiceViewModal from './components/QuickInvoiceViewModal'
import type { QuickInvoice } from '../../types/api'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'SAVED', label: 'Borrador' },
  { value: 'GENERATED', label: 'Generado' },
]

export default function QuickInvoiceListPage() {
  const navigate = useNavigate()
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [page, setPage] = useState(1)
  const [confirmTarget, setConfirmTarget] = useState<QuickInvoice | null>(null)
  const [viewTarget, setViewTarget] = useState<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const sendMutation = useSendQuickInvoice()
  const { data, isPending, isFetching, error, refetch } = useQuickInvoices({
    ruc: selectedRuc,
    search,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
  })

  const invoices = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const handleSend = (invoice: QuickInvoice) => {
    if (!selectedRuc) return
    sendMutation.mutate({ id: invoice.id, ruc: selectedRuc })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Facturas</h1>
          <p className="mt-1 text-sm text-muted">{total} facturas rápidas</p>
        </div>
        <Button color="blue" onClick={() => navigate('/quick-invoices/new')}>
          Nueva Factura
        </Button>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-warm p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por cliente, serie o secuencial..."
              className="w-full rounded-md border border-border-warm bg-canvas py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-border-warm bg-canvas px-2 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-border-warm bg-canvas px-2 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            />
            <span className="text-[12px] text-faint">a</span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-border-warm bg-canvas px-2 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar las facturas
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-sm text-faint">No hay facturas creadas</span>
              <button
                type="button"
                onClick={() => navigate('/quick-invoices/new')}
                className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
              >
                Crear la primera
              </button>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Comprobante</TableHeadCell>
                  <TableHeadCell>Cliente</TableHeadCell>
                  <TableHeadCell>Fecha</TableHeadCell>
                  <TableHeadCell>Estado</TableHeadCell>
                  <TableHeadCell>Total</TableHeadCell>
                  <TableHeadCell className="w-40 text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="bg-surface">
                    <TableCell>
                      <div className="font-mono text-[13px] text-ink">
                        {invoice.series}-{invoice.sequential}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-ink">{invoice.customer_name ?? '—'}</div>
                      <div className="font-mono text-[11px] text-faint">
                        {invoice.customer_identification ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted">{formatDate(invoice.emission_date)}</TableCell>
                    <TableCell>
                      <Badge tone={quickInvoiceStatusTone(invoice.status, invoice.document_status)}>
                        {quickInvoiceStatusLabel(invoice.status, invoice.document_status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-ink">
                      {invoice.total != null ? formatPrice(invoice.total) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewTarget(invoice.id)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                        >
                          Ver
                        </button>
                        {invoice.status === 'SAVED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/quick-invoices/${invoice.id}/edit`)}
                              className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={sendMutation.isPending}
                              onClick={() => setConfirmTarget(invoice)}
                              className="rounded-md px-2 py-1 text-[13px] font-medium text-success transition-colors duration-150 hover:bg-emerald-50"
                            >
                              Enviar
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

        {!isPending && invoices.length > 0 && (
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

      <ConfirmModal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (confirmTarget) handleSend(confirmTarget)
          setConfirmTarget(null)
        }}
        title="Enviar al SRI"
        message={
          confirmTarget
            ? `¿Está seguro de que desea enviar la factura ${confirmTarget.series}-${confirmTarget.sequential} al SRI?`
            : ''
        }
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />

      <QuickInvoiceViewModal invoiceId={viewTarget} onClose={() => setViewTarget(null)} />
    </div>
  )
}
