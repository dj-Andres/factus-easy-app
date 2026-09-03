import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useQuickRemissionGuides, useSendQuickRemissionGuide } from '../../hooks/useQuickRemissionGuides'
import { remissionGuideStatusLabel, remissionGuideStatusTone } from '../../lib/quickRemissionGuides'
import { formatDate } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import TablePagination from '../../components/ui/TablePagination'
import SortableTh from '../../components/ui/SortableTh'
import { useColumnSort } from '../../hooks/useColumnSort'
import QuickRemissionGuideViewModal from './components/QuickRemissionGuideViewModal'
import type { QuickRemissionGuide } from '../../types/api'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'SAVED', label: 'Borrador' },
  { value: 'GENERATED', label: 'Generado' },
]

export default function QuickRemissionGuideListPage() {
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
  const [confirmTarget, setConfirmTarget] = useState<QuickRemissionGuide | null>(null)
  const [viewTarget, setViewTarget] = useState<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
      resetSort()
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const sendMutation = useSendQuickRemissionGuide()
  const { data, isPending, isFetching, error, refetch } = useQuickRemissionGuides({
    ruc: selectedRuc,
    search,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
  })

  const guides = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const sortValue = (guide: QuickRemissionGuide, key: string): string | number | null | undefined => {
    switch (key) {
      case 'comprobante':
        return `${guide.series}-${guide.sequential}`
      case 'transportista':
        return guide.transportista?.name ?? ''
      case 'date':
        return guide.emission_date ?? ''
      case 'status':
        return guide.status
      default:
        return undefined
    }
  }
  const { sortedRows: sortedGuides, toggle: toggleSort, reset: resetSort, indicator } = useColumnSort(
    guides,
    sortValue,
  )

  const handleSend = (guide: QuickRemissionGuide) => {
    if (!selectedRuc) return
    sendMutation.mutate({ id: guide.id, ruc: selectedRuc })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Guías de Remisión</h1>
          <p className="mt-1 text-sm text-muted">{total} guías rápidas</p>
        </div>
        <Button color="blue" onClick={() => navigate('/quick-remission-guides/new')}>
          Nueva Guía de Remisión
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
              placeholder="Buscar por transportista, serie o secuencial..."
              className="w-full rounded-md border border-border-warm bg-canvas py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
                resetSort()
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
                resetSort()
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
                resetSort()
              }}
              className="rounded-md border border-border-warm bg-canvas px-2 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar las guías
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-sm text-faint">No hay guías de remisión creadas</span>
              <button
                type="button"
                onClick={() => navigate('/quick-remission-guides/new')}
                className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
              >
                Crear la primera
              </button>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <SortableTh label="Comprobante" onClick={() => toggleSort('comprobante')} indicator={indicator('comprobante')} />
                  <SortableTh label="Transportista" onClick={() => toggleSort('transportista')} indicator={indicator('transportista')} />
                  <SortableTh label="Fecha" onClick={() => toggleSort('date')} indicator={indicator('date')} />
                  <SortableTh label="Estado" onClick={() => toggleSort('status')} indicator={indicator('status')} />
                  <TableHeadCell className="w-40 text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedGuides.map((guide) => (
                  <TableRow key={guide.id} className="bg-surface">
                    <TableCell>
                      <div className="font-mono text-[13px] text-ink">
                        {guide.series}-{guide.sequential}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-ink">{guide.transportista?.name ?? '—'}</div>
                      <div className="font-mono text-[11px] text-faint">
                        {guide.transportista?.identification_number ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted">{formatDate(guide.emission_date)}</TableCell>
                    <TableCell>
                      <Badge tone={remissionGuideStatusTone(guide.status, guide.document_status)}>
                        {remissionGuideStatusLabel(guide.status, guide.document_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewTarget(guide.id)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-surface-2"
                        >
                          Ver
                        </button>
                        {guide.status === 'SAVED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/quick-remission-guides/${guide.id}/edit`)}
                              className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={sendMutation.isPending}
                              onClick={() => setConfirmTarget(guide)}
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

        {!isPending && guides.length > 0 && (
          <TablePagination page={page} lastPage={lastPage} onPageChange={(p) => setPage(p)} />
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
            ? `¿Está seguro de que desea enviar la guía ${confirmTarget.series}-${confirmTarget.sequential} al SRI?`
            : ''
        }
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />

      <QuickRemissionGuideViewModal guideId={viewTarget} onClose={() => setViewTarget(null)} />
    </div>
  )
}
