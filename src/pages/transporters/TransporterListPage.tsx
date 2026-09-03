import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useTransporters, useDeleteTransporter } from '../../hooks/useTransporters'
import ConfirmModal from '../../components/ui/ConfirmModal'
import TablePagination from '../../components/ui/TablePagination'
import SortableTh from '../../components/ui/SortableTh'
import { useColumnSort } from '../../hooks/useColumnSort'
import type { Transporter } from '../../types/api'
import TransporterFormPage from './TransporterFormPage'
import { IDENTIFICATION_TYPES } from './constants'

export default function TransporterListPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Transporter | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
      resetSort()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const deleteMutation = useDeleteTransporter()
  const { data, isPending, isFetching, error, refetch } = useTransporters({
    ruc: selectedRuc,
    search,
    page,
  })

  const transporters = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const sortValue = (transporter: Transporter, key: string): string | number | null | undefined => {
    switch (key) {
      case 'name':
        return transporter.name
      case 'identification':
        return transporter.identification_number ?? ''
      case 'phone':
        return transporter.phone ?? ''
      case 'placa':
        return transporter.placa ?? ''
      default:
        return undefined
    }
  }
  const { sortedRows: sortedTransporters, toggle: toggleSort, reset: resetSort, indicator } = useColumnSort(
    transporters,
    sortValue,
  )

  const handleDelete = (transporter: Transporter) => {
    deleteMutation.mutate(transporter.id)
  }

  const openCreate = () => {
    setEditingTransporter(null)
    setShowForm(true)
  }

  const openEdit = (transporter: Transporter) => {
    setEditingTransporter(transporter)
    setShowForm(true)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingTransporter(null)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Transportistas</h1>
          <p className="mt-1 text-sm text-muted">{total} transportistas en total</p>
        </div>
        <Button color="blue" onClick={openCreate}>
          Nuevo Transportista
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
              placeholder="Buscar por nombre, identificación o placa..."
              className="w-full rounded-md border border-border-warm bg-canvas py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar los transportistas
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : transporters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-sm text-faint">No hay transportistas registrados</span>
              <button
                type="button"
                onClick={openCreate}
                className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <SortableTh label="Razón social" onClick={() => toggleSort('name')} indicator={indicator('name')} />
                  <SortableTh label="Identificación" onClick={() => toggleSort('identification')} indicator={indicator('identification')} />
                  <SortableTh label="Teléfono" onClick={() => toggleSort('phone')} indicator={indicator('phone')} />
                  <SortableTh label="Placa" onClick={() => toggleSort('placa')} indicator={indicator('placa')} />
                  <TableHeadCell className="w-32 text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTransporters.map((transporter) => (
                  <TableRow key={transporter.id} className="bg-surface">
                    <TableCell className="font-medium text-ink">{transporter.name}</TableCell>
                    <TableCell>
                      <div className="text-[13px] text-ink">{transporter.identification_number}</div>
                      <div className="text-[11px] text-faint">
                        {IDENTIFICATION_TYPES[transporter.identification_type] ?? transporter.identification_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted">{transporter.phone ?? '—'}</TableCell>
                    <TableCell>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[12px] font-medium uppercase tracking-wide text-ink">
                        {transporter.placa}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(transporter)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmTarget(transporter)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                        >
                          Eliminar
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!isPending && transporters.length > 0 && (
          <TablePagination page={page} lastPage={lastPage} onPageChange={(p) => setPage(p)} />
        )}
      </div>

      <TransporterFormPage
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTransporter(null)
        }}
        transporter={editingTransporter}
        onSaved={handleSaved}
      />

      <ConfirmModal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (confirmTarget) handleDelete(confirmTarget)
          setConfirmTarget(null)
        }}
        title="Eliminar transportista"
        message={confirmTarget ? `¿Eliminar a ${confirmTarget.name}?` : ''}
        confirmLabel="Eliminar"
        confirmColor="red"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
