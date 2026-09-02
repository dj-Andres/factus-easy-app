import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers'
import ConfirmModal from '../../components/ui/ConfirmModal'
import TablePagination from '../../components/ui/TablePagination'
import SortableTh from '../../components/ui/SortableTh'
import { useColumnSort } from '../../hooks/useColumnSort'
import type { Customer } from '../../types/api'
import CustomerFormPage from './CustomerFormPage'
import { IDENTIFICATION_TYPES } from './constants'

export default function CustomerListPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
      resetSort()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const deleteMutation = useDeleteCustomer()
  const { data, isPending, isFetching, error, refetch } = useCustomers({
    ruc: selectedRuc,
    search,
    page,
  })

  const customers = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const sortValue = (customer: Customer, key: string): string | number | null | undefined => {
    switch (key) {
      case 'name':
        return customer.name
      case 'identification':
        return customer.identification_number ?? ''
      case 'email':
        return customer.email ?? ''
      case 'phone':
        return customer.phone ?? ''
      default:
        return undefined
    }
  }
  const { sortedRows: sortedCustomers, toggle: toggleSort, reset: resetSort, indicator } = useColumnSort(
    customers,
    sortValue,
  )

  const handleDelete = (customer: Customer) => {
    deleteMutation.mutate(customer.id)
  }

  const openCreate = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingCustomer(null)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-muted">{total} clientes en total</p>
        </div>
        <Button color="blue" onClick={openCreate}>
          Nuevo Cliente
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
              placeholder="Buscar por nombre o identificación..."
              className="w-full rounded-md border border-border-warm bg-canvas py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar los clientes
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-sm text-faint">No hay clientes registrados</span>
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
                  <SortableTh label="Nombre" onClick={() => toggleSort('name')} indicator={indicator('name')} />
                  <SortableTh label="Identificación" onClick={() => toggleSort('identification')} indicator={indicator('identification')} />
                  <SortableTh label="Email" onClick={() => toggleSort('email')} indicator={indicator('email')} />
                  <SortableTh label="Teléfono" onClick={() => toggleSort('phone')} indicator={indicator('phone')} />
                  <TableHeadCell className="w-32 text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="bg-surface">
                    <TableCell className="font-medium text-ink">
                      {customer.name}
                      {customer.is_consumer_final && (
                        <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          Consumidor final
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-[13px] text-ink">{customer.identification_number}</div>
                      <div className="text-[11px] text-faint">
                        {IDENTIFICATION_TYPES[customer.identification_type] ?? customer.identification_type}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted">{customer.email ?? '—'}</TableCell>
                    <TableCell className="text-muted">{customer.phone ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmTarget(customer)}
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

        {!isPending && customers.length > 0 && (
          <TablePagination page={page} lastPage={lastPage} onPageChange={(p) => setPage(p)} />
        )}
      </div>

      <CustomerFormPage
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingCustomer(null)
        }}
        customer={editingCustomer}
        onSaved={handleSaved}
      />

      <ConfirmModal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => {
          if (confirmTarget) handleDelete(confirmTarget)
          setConfirmTarget(null)
        }}
        title="Eliminar cliente"
        message={confirmTarget ? `¿Eliminar a ${confirmTarget.name}?` : ''}
        confirmLabel="Eliminar"
        confirmColor="red"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
