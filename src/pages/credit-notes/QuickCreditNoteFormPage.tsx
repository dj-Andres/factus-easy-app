import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Spinner } from 'flowbite-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCompany } from '../../hooks/useCompany'
import { useEstablishments } from '../../hooks/useEstablishments'
import { useEmissionPoints } from '../../hooks/useEmissionPoints'
import {
  useCreateQuickCreditNote,
  useQuickCreditNote,
  useSendQuickCreditNote,
  useUpdateQuickCreditNote,
  useLookupOriginalInvoice,
} from '../../hooks/useQuickCreditNotes'
import { getProducts } from '../../api/products'
import { getCustomers } from '../../api/customers'
import { quickCreditNoteStatusLabel, quickCreditNoteStatusTone } from '../../lib/quickCreditNotes'
import { parseNum } from '../../lib/numbers'
import { toErrorMessage } from '../../lib/errors'
import type { CreditNoteType, Product, QuickCreditNoteInput, TaxDetail } from '../../types/api'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import InvoiceHeader from '../invoices/components/InvoiceHeader'
import OriginalInvoiceLookup from './components/OriginalInvoiceLookup'
import CreditNoteItemsTable from './components/CreditNoteItemsTable'
import CreditNoteTotals from './components/CreditNoteTotals'
import {
  buildCreditNoteBreakdown,
  type CreditNoteFormItem,
} from './quickCreditNoteForm'
import type { InfoRow } from '../invoices/invoiceForm'

function todayDisplay(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export default function QuickCreditNoteFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { selectedCompany, isLoading: companyLoading } = useCompany()

  const creditNoteId = id ? Number(id) : null
  const mode: 'create' | 'edit' | 'view' = creditNoteId
    ? location.pathname.endsWith('/edit')
      ? 'edit'
      : 'view'
    : 'create'
  const isReadonly = mode === 'view'

  const keyCounter = useRef(1)
  const nextItemKey = () => `cn-item-${keyCounter.current++}`

  const { data: establishments, isPending: establishmentsLoading } = useEstablishments(selectedRuc)
  const { data: creditNote, isPending: creditNoteLoading } = useQuickCreditNote(selectedRuc, creditNoteId)

  const [creditNoteType, setCreditNoteType] = useState<CreditNoteType>('devolucion')
  const [motivo, setMotivo] = useState('')
  const [originalSeries, setOriginalSeries] = useState('')
  const [originalSequential, setOriginalSequential] = useState('')
  const [lookupEnabled, setLookupEnabled] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [establishmentId, setEstablishmentId] = useState<number | ''>('')
  const [emissionPointId, setEmissionPointId] = useState<number | ''>('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [items, setItems] = useState<CreditNoteFormItem[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<InfoRow[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSendConfirm, setShowSendConfirm] = useState(false)

  const { data: emissionPoints, isPending: emissionPointsLoading } = useEmissionPoints(
    selectedRuc,
    establishmentId || undefined,
  )

  const productsQuery = useQuery({
    queryKey: ['products', 'all', selectedRuc],
    queryFn: () => getProducts({ ruc: selectedRuc!, per_page: 500 }),
    enabled: !!selectedRuc,
  })
  const customersQuery = useQuery({
    queryKey: ['customers', 'all', selectedRuc],
    queryFn: () => getCustomers({ ruc: selectedRuc!, per_page: 500 }),
    enabled: !!selectedRuc,
  })

  const products = productsQuery.data?.data ?? []
  const customers = customersQuery.data?.data ?? []

  const createMutation = useCreateQuickCreditNote()
  const updateMutation = useUpdateQuickCreditNote()
  const sendMutation = useSendQuickCreditNote()

  const lookupQuery = useLookupOriginalInvoice(selectedRuc, originalSeries, originalSequential, lookupEnabled)
  const originalInvoice = lookupQuery.data ?? null

  const productsById = new Map<number, Product>()
  for (const p of products) productsById.set(p.id, p)

  const lookupErrorMessage = lookupQuery.error ? toErrorMessage(lookupQuery.error) : lookupError

  useEffect(() => {
    if (!creditNote) return
    setCreditNoteType(creditNote.credit_note_type)
    setMotivo(creditNote.motivo)
    setOriginalSeries(creditNote.original_invoice_series)
    setOriginalSequential(creditNote.original_invoice_sequential)
    setLookupEnabled(true)
    setEstablishmentId(creditNote.establishment_id)
    setEmissionPointId(creditNote.emission_point_id)
    setCustomerId(creditNote.customer_id)
    setAdditionalInfo(Object.entries(creditNote.additional_info ?? {}).map(([clave, valor]) => ({ clave, valor })))
    setItems(
      (creditNote.items ?? []).map((i) => ({
        key: nextItemKey(),
        productId: i.product_id,
        cantidad: String(i.cantidad),
        precioUnitario: i.precio_unitario != null ? String(i.precio_unitario) : '',
        descuento: i.descuento ? String(i.descuento) : '',
        taxes: i.impuestos ?? [],
      })),
    )
  }, [creditNote])

  useEffect(() => {
    if (creditNoteId) return
    if (establishmentId === '' && establishments && establishments.length > 0) {
      const active = establishments.find((e) => e.status === 'ACTIVE') ?? establishments[0]
      setEstablishmentId(active.id)
    }
  }, [establishments, establishmentId, creditNoteId])

  useEffect(() => {
    if (creditNoteId) return
    if (emissionPoints && emissionPoints.length > 0) {
      const current = emissionPoints.find((p) => p.id === emissionPointId)
      if (!current) {
        const active = emissionPoints.find((p) => p.status === 'ACTIVE') ?? emissionPoints[0]
        setEmissionPointId(active.id)
      }
    }
  }, [emissionPoints, emissionPointId, creditNoteId])

  useEffect(() => {
    if (creditNoteId || !originalInvoice) return
    setCustomerId(originalInvoice.customer_id)
    setItems(
      (originalInvoice.items ?? []).map((i) => ({
        key: nextItemKey(),
        productId: i.product_id,
        cantidad: String(i.cantidad),
        precioUnitario: i.precio_unitario != null ? String(i.precio_unitario) : '',
        descuento: i.descuento ? String(i.descuento) : '',
        taxes: (i.impuestos ?? []) as TaxDetail[],
      })),
    )
  }, [originalInvoice, creditNoteId])

  const breakdown = useMemo(
    () => buildCreditNoteBreakdown(items, productsById),
    [items, products],
  )

  const baseImponible = breakdown.reduce((sum, b) => sum + b.base, 0)
  const totalImpuestos = breakdown.reduce((sum, b) => sum + b.taxTotal, 0)
  const totalDescuento = breakdown.reduce((sum, b) => sum + b.descuento, 0)
  const total = baseImponible + totalImpuestos

  const subtotalIva = breakdown.reduce((sum, b) => {
    const hasIva = b.taxes.some((t) => t.codigo === '2' && t.tarifa > 0)
    return hasIva ? sum + b.base : sum
  }, 0)
  const subtotalCero = breakdown.reduce((sum, b) => {
    const hasIva = b.taxes.some((t) => t.codigo === '2' && t.tarifa > 0)
    return hasIva ? sum : sum + b.base
  }, 0)
  const iva = breakdown.reduce(
    (sum, b) => sum + b.taxes.filter((t) => t.codigo === '2').reduce((a, t) => a + t.valor, 0),
    0,
  )
  const ice = breakdown.reduce(
    (sum, b) => sum + b.taxes.filter((t) => t.codigo === '3').reduce((a, t) => a + t.valor, 0),
    0,
  )

  const establishment = establishments?.find((e) => e.id === establishmentId) ?? null
  const emissionPoint = emissionPoints?.find((p) => p.id === emissionPointId) ?? null
  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null

  const buildPayload = (): QuickCreditNoteInput | null => {
    if (!selectedRuc || establishmentId === '' || emissionPointId === '' || customerId === '') {
      setApiError('Debe seleccionar establecimiento, punto de emisión y cliente.')
      return null
    }

    if (motivo.trim() === '') {
      setApiError('El motivo es obligatorio.')
      return null
    }

    if (originalSeries.length !== 6 || originalSequential.length !== 9) {
      setApiError('Debe ingresar la serie (6 dígitos) y secuencial (9 dígitos) de la factura original.')
      return null
    }

    const validItems = items.filter((i) => i.productId !== '')
    if (validItems.length === 0) {
      setApiError('Debe agregar al menos un producto.')
      return null
    }

    for (const i of validItems) {
      if (parseNum(i.cantidad) <= 0) {
        setApiError('Las cantidades deben ser mayores a 0.')
        return null
      }
    }

    const infoRecord: Record<string, string> = {}
    for (const row of additionalInfo) {
      if (row.clave.trim() !== '') infoRecord[row.clave.trim()] = row.valor
    }

    return {
      ruc: selectedRuc,
      establishment_id: Number(establishmentId),
      emission_point_id: Number(emissionPointId),
      customer_id: Number(customerId),
      credit_note_type: creditNoteType,
      motivo: motivo.trim(),
      original_invoice_series: originalSeries,
      original_invoice_sequential: originalSequential,
      items: validItems.map((i) => {
        const product = productsById.get(Number(i.productId))
        const resolvedPrecio = i.precioUnitario.trim() !== ''
          ? parseNum(i.precioUnitario)
          : (product?.unit_price ?? 0)
        const item: QuickCreditNoteInput['items'][number] = {
          product_id: Number(i.productId),
          cantidad: parseNum(i.cantidad),
          precioUnitario: resolvedPrecio,
        }
        if (parseNum(i.descuento) > 0) item.descuento = parseNum(i.descuento)
        return item
      }),
      additional_info: Object.keys(infoRecord).length > 0 ? infoRecord : undefined,
    }
  }

  const handleSave = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload) return

    const onSuccess = () => navigate('/quick-credit-notes')
    const onError = (err: unknown) => setApiError(toErrorMessage(err))

    if (mode === 'edit' && creditNoteId) {
      updateMutation.mutate({ id: creditNoteId, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  const handleSend = () => {
    if (!selectedRuc || !creditNoteId) return
    setApiError(null)

    const doSend = () =>
      sendMutation.mutate(
        { id: creditNoteId, ruc: selectedRuc },
        {
          onSuccess: () => navigate('/quick-credit-notes'),
          onError: (err) => setApiError(toErrorMessage(err)),
        },
      )

    if (mode === 'edit') {
      const payload = buildPayload()
      if (!payload) return
      updateMutation.mutate({ id: creditNoteId, data: payload }, {
        onSuccess: doSend,
        onError: (err) => setApiError(toErrorMessage(err)),
      })
      return
    }

    doSend()
  }

  const handleSaveAndSend = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload || !selectedRuc) return
    createMutation.mutate(payload, {
      onSuccess: (created) => {
        sendMutation.mutate(
          { id: created.id, ruc: selectedRuc },
          {
            onSuccess: () => navigate('/quick-credit-notes'),
            onError: (err) => setApiError(toErrorMessage(err)),
          },
        )
      },
      onError: (err) => setApiError(toErrorMessage(err)),
    })
  }

  const updateItem = (key: string, patch: Partial<CreditNoteFormItem>) => {
    setItems((prev) => prev.map((i) => {
      if (i.key !== key) return i
      const next = { ...i, ...patch }
      if ('productId' in patch && patch.productId && next.precioUnitario.trim() === '') {
        const product = productsById.get(Number(patch.productId))
        if (product) next.precioUnitario = String(product.unit_price)
      }
      return next
    }))
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  const addInfoRow = () => setAdditionalInfo((prev) => [...prev, { clave: '', valor: '' }])
  const updateInfoRow = (index: number, patch: Partial<InfoRow>) =>
    setAdditionalInfo((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const removeInfoRow = (index: number) => setAdditionalInfo((prev) => prev.filter((_, i) => i !== index))

  const busy = createMutation.isPending || updateMutation.isPending || sendMutation.isPending

  const isInitialLoading =
    companyLoading ||
    establishmentsLoading ||
    emissionPointsLoading ||
    productsQuery.isPending ||
    customersQuery.isPending ||
    (creditNoteId !== null && creditNoteLoading)

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" color="info" />
      </div>
    )
  }

  if (creditNoteId && !creditNote) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-sm text-muted">No se encontró la nota de crédito</span>
        <button
          type="button"
          onClick={() => navigate('/quick-credit-notes')}
          className="mt-2 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  const companyName = selectedCompany?.business_name || selectedCompany?.name || 'Empresa'
  const companyMonogram = companyName.trim().charAt(0).toUpperCase()
  const contact = [selectedCompany?.phone, selectedCompany?.email].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/quick-credit-notes')}
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              ← Volver
            </button>
            {creditNote && (
              <Badge tone={quickCreditNoteStatusTone(creditNote.status, creditNote.document_status)}>
                {quickCreditNoteStatusLabel(creditNote.status, creditNote.document_status)}
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {mode === 'create'
              ? 'Nueva Nota de Crédito'
              : mode === 'edit'
                ? 'Editar Nota de Crédito'
                : 'Detalle de Nota de Crédito'}
          </h1>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {mode === 'create' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy} className="active:scale-[0.98]">
                Guardar
              </Button>
              <Button type="button" color="blue" onClick={handleSaveAndSend} disabled={busy} className="active:scale-[0.98]">
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar y Enviar
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy} className="active:scale-[0.98]">
                {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar cambios
              </Button>
              <Button type="button" color="blue" onClick={() => setShowSendConfirm(true)} disabled={busy} className="active:scale-[0.98]">
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Enviar
              </Button>
            </>
          )}
          {mode === 'view' && (
            <Button type="button" color="blue" onClick={() => navigate('/quick-credit-notes')}>
              Volver
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <Alert color="red" onDismiss={() => setApiError(null)} className="animate-slide-down">
          {apiError}
        </Alert>
      )}

      <div className="animate-fade-up overflow-hidden rounded-lg border border-border-warm bg-surface shadow-card">
        <InvoiceHeader
          companyName={companyName}
          companyMonogram={companyMonogram}
          ruc={selectedCompany?.ruc ?? selectedRuc ?? '—'}
          address={selectedCompany?.address ?? null}
          contact={contact}
          series={
            creditNote
              ? `${creditNote.series}-${creditNote.sequential}`
              : establishment && emissionPoint
                ? `${establishment.code}-${emissionPoint.code}`
                : '—'
          }
          date={todayDisplay()}
        />

        <div className="grid grid-cols-1 gap-4 border-b border-border-warm p-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Tipo de nota</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="radio"
                  checked={creditNoteType === 'devolucion'}
                  onChange={() => setCreditNoteType('devolucion')}
                  disabled={isReadonly}
                  className="h-4 w-4 accent-accent"
                />
                Devolución
              </label>
              <label className="flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="radio"
                  checked={creditNoteType === 'descuento'}
                  onChange={() => setCreditNoteType('descuento')}
                  disabled={isReadonly}
                  className="h-4 w-4 accent-accent"
                />
                Descuento
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-muted">Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={isReadonly}
              maxLength={300}
              rows={2}
              placeholder="Motivo de la nota de crédito"
              className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <OriginalInvoiceLookup
          series={originalSeries}
          sequential={originalSequential}
          readonly={isReadonly}
          searching={lookupQuery.isFetching}
          invoice={originalInvoice}
          error={lookupErrorMessage}
          onSeriesChange={(v) => {
            setOriginalSeries(v)
            setLookupEnabled(false)
            setLookupError(null)
          }}
          onSequentialChange={(v) => {
            setOriginalSequential(v)
            setLookupEnabled(false)
            setLookupError(null)
          }}
        />

        <div className="flex justify-end border-b border-border-warm px-6 py-3">
          <Button
            type="button"
            color="gray"
            size="xs"
            disabled={isReadonly || originalSeries.length !== 6 || originalSequential.length !== 9 || lookupQuery.isFetching}
            onClick={() => {
              setLookupError(null)
              setLookupEnabled(true)
              lookupQuery.refetch()
            }}
          >
            {lookupQuery.isFetching ? 'Buscando…' : 'Buscar factura'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-border-warm p-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Emisor</h3>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Establecimiento</label>
              <select
                value={establishmentId}
                onChange={(e) => {
                  setEstablishmentId(e.target.value ? Number(e.target.value) : '')
                  setEmissionPointId('')
                }}
                disabled={isReadonly || establishmentsLoading}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {(establishments ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} - {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-muted">Punto de emisión</label>
              <select
                value={emissionPointId}
                onChange={(e) => setEmissionPointId(e.target.value ? Number(e.target.value) : '')}
                disabled={isReadonly || establishmentId === ''}
                className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {(emissionPoints ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Cliente</h3>
            {selectedCustomer ? (
              <div className="mt-3 rounded-md bg-canvas/50 px-3 py-2 text-[12px] text-muted">
                <p className="text-[13px] font-medium text-ink">{selectedCustomer.name}</p>
                <p>
                  <span className="font-medium text-ink">RUC/CI:</span>{' '}
                  {selectedCustomer.identification_number}
                </p>
                {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
              </div>
            ) : (
              <p className="mt-3 text-[12px] text-faint">
                El cliente se asigna automáticamente desde la factura original.
              </p>
            )}
          </div>
        </div>

        <CreditNoteItemsTable
          items={items}
          breakdown={breakdown}
          readonly={isReadonly}
          onUpdate={updateItem}
          onRemove={removeItem}
        />

        <CreditNoteTotals
          baseImponible={baseImponible}
          subtotalIva={subtotalIva}
          subtotalCero={subtotalCero}
          totalDescuento={totalDescuento}
          iva={iva}
          ice={ice}
          total={total}
        />

        <div className="border-t border-border-warm p-6">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-medium text-muted">Información adicional</label>
            {!isReadonly && (
              <button
                type="button"
                onClick={addInfoRow}
                className="mb-1 rounded-md border border-border-warm px-2 py-0.5 text-[11px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
              >
                + Agregar
              </button>
            )}
          </div>
          {additionalInfo.length === 0 && <p className="text-[12px] text-faint">Sin información adicional</p>}
          <div className="space-y-2">
            {additionalInfo.map((row, index) => (
              <div key={index} className="animate-fade-in flex items-center gap-2">
                <input
                  type="text"
                  value={row.clave}
                  onChange={(e) => updateInfoRow(index, { clave: e.target.value })}
                  disabled={isReadonly}
                  placeholder="Clave"
                  className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={row.valor}
                  onChange={(e) => updateInfoRow(index, { valor: e.target.value })}
                  disabled={isReadonly}
                  placeholder="Valor"
                  className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                />
                {!isReadonly && (
                  <button
                    type="button"
                    onClick={() => removeInfoRow(index)}
                    className="rounded-md px-2 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={() => {
          setShowSendConfirm(false)
          handleSend()
        }}
        title="Enviar al SRI"
        message="¿Está seguro de que desea enviar esta nota de crédito al SRI?"
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />
    </div>
  )
}
