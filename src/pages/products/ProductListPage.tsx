import { useEffect, useState } from 'react'
import { Alert, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useAuthStore } from '../../stores/authStore'
import { useDeleteProduct, useProductOptions, useProducts } from '../../hooks/useProducts'
import type { Product } from '../../types/api'
import ProductFormPage from './ProductFormPage'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export default function ProductListPage() {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [productKind, setProductKind] = useState('')
  const [sriProductType, setSriProductType] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: options } = useProductOptions()
  const deleteMutation = useDeleteProduct()

  const { data, isPending, isFetching, error, refetch } = useProducts({
    ruc: selectedRuc,
    search,
    page,
    productKind: productKind || undefined,
    sriProductType: sriProductType || undefined,
  })

  const products = data?.data ?? []
  const lastPage = data?.last_page ?? 1
  const total = data?.total ?? 0

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`¿Eliminar "${product.description}"?`)) return
    deleteMutation.mutate(product.id)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditingProduct(null)
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Productos</h1>
          <p className="mt-1 text-sm text-muted">{total} productos en total</p>
        </div>
        <Button color="blue" onClick={openCreate}>
          Nuevo Producto
        </Button>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-border-warm p-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
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
              placeholder="Buscar por descripción..."
              className="w-full rounded-md border border-border-warm bg-canvas py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={productKind}
              onChange={(e) => {
                setProductKind(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Todos los tipos</option>
              {(options?.product_kinds ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sriProductType}
              onChange={(e) => {
                setSriProductType(e.target.value)
                setPage(1)
              }}
              className="rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Todos los tipos SRI</option>
              {(options?.sri_product_types ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="px-4 pt-4">
            <Alert color="red" onDismiss={() => refetch()}>
              No se pudieron cargar los productos
            </Alert>
          </div>
        )}

        <div className={isFetching && !isPending ? 'opacity-60' : ''}>
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" color="info" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-sm text-faint">No hay productos registrados</span>
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
                  <TableHeadCell>Descripción</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Tipo SRI</TableHeadCell>
                  <TableHeadCell>Precio</TableHeadCell>
                  <TableHeadCell>Impuestos</TableHeadCell>
                  <TableHeadCell className="w-32 text-right">Acciones</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="bg-surface">
                    <TableCell className="font-medium text-ink">
                      {product.description}
                      {product.auxiliary_code && (
                        <div className="font-mono text-[11px] text-faint">{product.auxiliary_code}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted">{product.product_kind_label ?? product.product_kind}</TableCell>
                    <TableCell className="text-muted">
                      {product.sri_product_type_label ?? product.sri_product_type}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] text-ink">
                      {formatPrice(product.unit_price)}
                    </TableCell>
                    <TableCell className="text-muted">
                      {product.taxes?.map((tax) => tax.name).join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-md px-2 py-1 text-[13px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
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

        {!isPending && products.length > 0 && (
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

      <ProductFormPage
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSaved={handleSaved}
      />
    </div>
  )
}
