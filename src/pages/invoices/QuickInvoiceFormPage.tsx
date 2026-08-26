import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Spinner } from 'flowbite-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCompany } from '../../hooks/useCompany'
import { useEstablishments } from '../../hooks/useEstablishments'
import { useEmissionPoints } from '../../hooks/useEmissionPoints'
import { useQuickInvoice, useCreateQuickInvoice, useUpdateQuickInvoice, useSendQuickInvoice } from '../../hooks/useQuickInvoices'
import { getProducts } from '../../api/products'
import { getCustomers } from '../../api/customers'
import { quickInvoiceStatusLabel, quickInvoiceStatusTone } from '../../lib/quickInvoices'
import { parseNum } from '../../lib/numbers'
import { toErrorMessage } from '../../lib/errors'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import InvoiceHeader from './components/InvoiceHeader'
import IssuerCustomer from './components/IssuerCustomer'
import InvoiceItemsTable from './components/InvoiceItemsTable'
import InvoiceTotals from './components/InvoiceTotals'
import InvoicePayments from './components/InvoicePayments'
import InvoiceFooter from './components/InvoiceFooter'
import paymentMethodsJson from '../../data/paymentMethods.json'
import {
  buildBreakdown,
  groupTaxes,
  resolvePayments,
  type FormItem,
  type FormPayment,
  type InfoRow,
} from './invoiceForm'
import type { Product, QuickInvoiceInput } from '../../types/api'

const paymentMethods = paymentMethodsJson as { code: string; name: string }[]

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function todayDisplay(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export default function QuickInvoiceFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const { selectedCompany } = useCompany()

  const invoiceId = id ? Number(id) : null
  const mode: 'create' | 'edit' | 'view' = invoiceId
    ? location.pathname.endsWith('/edit')
      ? 'edit'
      : 'view'
    : 'create'
  const isReadonly = mode === 'view'

  const keyCounter = useRef(1)
  const nextItemKey = () => `item-${keyCounter.current++}`
  const nextPayKey = () => `pay-${keyCounter.current++}`

  const { data: establishments, isPending: establishmentsLoading } = useEstablishments(selectedRuc)
  const { data: invoice, isPending: invoiceLoading } = useQuickInvoice(selectedRuc, invoiceId)

  const [establishmentId, setEstablishmentId] = useState<number | ''>('')
  const [emissionPointId, setEmissionPointId] = useState<number | ''>('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [licensePlate, setLicensePlate] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState<InfoRow[]>([])
  const [items, setItems] = useState<FormItem[]>([
    { key: 'item-0', productId: '', cantidad: '1', precioUnitario: '', descuento: '' },
  ])
  const [payments, setPayments] = useState<FormPayment[]>([
    { key: 'pay-0', formaPago: paymentMethods[0]?.code ?? '01', total: '' },
  ])
  const [apiError, setApiError] = useState<string | null>(null)
  const [showSendConfirm, setShowSendConfirm] = useState(false)

  const { data: emissionPoints } = useEmissionPoints(selectedRuc, establishmentId || undefined)

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

  const createMutation = useCreateQuickInvoice()
  const updateMutation = useUpdateQuickInvoice()
  const sendMutation = useSendQuickInvoice()

  const productsById = new Map<number, Product>()
  for (const p of products) productsById.set(p.id, p)

  useEffect(() => {
    if (!invoice) return
    setEstablishmentId(invoice.establishment_id)
    setEmissionPointId(invoice.emission_point_id)
    setCustomerId(invoice.customer_id)
    setLicensePlate(invoice.license_plate ?? '')
    setAdditionalInfo(
      Object.entries(invoice.additional_info ?? {}).map(([clave, valor]) => ({ clave, valor })),
    )
    setItems(
      (invoice.items ?? []).map((i) => ({
        key: nextItemKey(),
        productId: i.product_id,
        cantidad: String(i.cantidad),
        precioUnitario: i.precio_unitario != null ? String(i.precio_unitario) : '',
        descuento: i.descuento ? String(i.descuento) : '',
      })),
    )
    const stored = invoice.formas_pago && invoice.formas_pago.length > 0
      ? invoice.formas_pago
      : [{ formaPago: invoice.payment_method, total: invoice.total ?? 0 }]
    setPayments(
      stored.map((p) => ({
        key: nextPayKey(),
        formaPago: p.formaPago,
        total: p.total != null ? String(p.total) : '',
      })),
    )
  }, [invoice])

  useEffect(() => {
    if (invoiceId) return
    if (establishmentId === '' && establishments && establishments.length > 0) {
      const active = establishments.find((e) => e.status === 'ACTIVE') ?? establishments[0]
      setEstablishmentId(active.id)
    }
  }, [establishments, establishmentId, invoiceId])

  useEffect(() => {
    if (invoiceId) return
    if (emissionPoints && emissionPoints.length > 0) {
      const current = emissionPoints.find((p) => p.id === emissionPointId)
      if (!current) {
        const active = emissionPoints.find((p) => p.status === 'ACTIVE') ?? emissionPoints[0]
        setEmissionPointId(active.id)
      }
    }
  }, [emissionPoints, emissionPointId, invoiceId])

  useEffect(() => {
    if (invoiceId) return
    if (customerId === '' && customers.length > 0) {
      setCustomerId(customers[0].id)
    }
  }, [customers, customerId, invoiceId])

  const breakdown = buildBreakdown(items, productsById)

  const subtotal = breakdown.reduce((sum, b) => sum + b.base, 0)
  const totalImpuestos = breakdown.reduce((sum, b) => sum + b.taxTotal, 0)
  const totalDescuento = breakdown.reduce((sum, b) => sum + b.descuento, 0)
  const total = subtotal + totalImpuestos

  const taxGroupList = groupTaxes(breakdown)

  const establishment = establishments?.find((e) => e.id === establishmentId) ?? null
  const emissionPoint = emissionPoints?.find((p) => p.id === emissionPointId) ?? null
  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null

  const buildPayload = (): QuickInvoiceInput | null => {
    if (!selectedRuc || establishmentId === '' || emissionPointId === '' || customerId === '') {
      setApiError('Debe seleccionar establecimiento, punto de emisión y cliente.')
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

    const validPayments = payments.filter((p) => p.formaPago !== '')
    if (validPayments.length === 0) {
      setApiError('Debe seleccionar al menos una forma de pago.')
      return null
    }

    const resolvedPayments = resolvePayments(payments, total)
    const lastTotal = resolvedPayments[resolvedPayments.length - 1].total
    if (lastTotal < 0) {
      setApiError('El monto de las formas de pago excede el total de la factura.')
      return null
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
      items: validItems.map((i) => {
        const item: QuickInvoiceInput['items'][number] = {
          product_id: Number(i.productId),
          cantidad: parseNum(i.cantidad),
        }
        if (i.precioUnitario.trim() !== '') item.precioUnitario = parseNum(i.precioUnitario)
        if (parseNum(i.descuento) > 0) item.descuento = parseNum(i.descuento)
        return item
      }),
      formas_pago: resolvedPayments,
      license_plate: licensePlate.trim() !== '' ? licensePlate : undefined,
      additional_info: Object.keys(infoRecord).length > 0 ? infoRecord : undefined,
      emission_date: todayString(),
    }
  }

  const handleSave = () => {
    setApiError(null)
    const payload = buildPayload()
    if (!payload) return

    const onSuccess = () => navigate('/quick-invoices')
    const onError = (err: unknown) => setApiError(toErrorMessage(err))

    if (mode === 'edit' && invoiceId) {
      updateMutation.mutate({ id: invoiceId, data: payload }, { onSuccess, onError })
    } else {
      createMutation.mutate(payload, { onSuccess, onError })
    }
  }

  const handleSend = () => {
    if (!selectedRuc || !invoiceId) return
    setApiError(null)
    sendMutation.mutate(
      { id: invoiceId, ruc: selectedRuc },
      {
        onSuccess: () => navigate('/quick-invoices'),
        onError: (err) => setApiError(toErrorMessage(err)),
      },
    )
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
            onSuccess: () => navigate('/quick-invoices'),
            onError: (err) => setApiError(toErrorMessage(err)),
          },
        )
      },
      onError: (err) => setApiError(toErrorMessage(err)),
    })
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: nextItemKey(), productId: '', cantidad: '1', precioUnitario: '', descuento: '' },
    ])
  }

  const updateItem = (key: string, patch: Partial<FormItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))
  }

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      { key: nextPayKey(), formaPago: paymentMethods[0]?.code ?? '01', total: '' },
    ])
  }

  const updatePayment = (key: string, patch: Partial<FormPayment>) => {
    setPayments((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)))
  }

  const removePayment = (key: string) => {
    setPayments((prev) => prev.filter((p) => p.key !== key))
  }

  const addInfoRow = () => setAdditionalInfo((prev) => [...prev, { clave: '', valor: '' }])
  const updateInfoRow = (index: number, patch: Partial<InfoRow>) =>
    setAdditionalInfo((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const removeInfoRow = (index: number) => setAdditionalInfo((prev) => prev.filter((_, i) => i !== index))

  const busy = createMutation.isPending || updateMutation.isPending || sendMutation.isPending

  if (invoiceId && invoiceLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" color="info" />
      </div>
    )
  }

  if (invoiceId && !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-sm text-muted">No se encontró la factura</span>
        <button
          type="button"
          onClick={() => navigate('/quick-invoices')}
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
              onClick={() => navigate('/quick-invoices')}
              className="text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              ← Volver
            </button>
            {invoice && (
              <Badge tone={quickInvoiceStatusTone(invoice.status, invoice.document_status)}>
                {quickInvoiceStatusLabel(invoice.status, invoice.document_status)}
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {mode === 'create' ? 'Nueva Factura' : mode === 'edit' ? 'Editar Factura' : 'Detalle de Factura'}
          </h1>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          {mode === 'create' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy}>
                Guardar
              </Button>
              <Button type="button" color="blue" onClick={handleSaveAndSend} disabled={busy}>
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar y Enviar
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button type="button" color="gray" onClick={handleSave} disabled={busy}>
                {updateMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Guardar cambios
              </Button>
              <Button type="button" color="blue" onClick={() => setShowSendConfirm(true)} disabled={busy}>
                {sendMutation.isPending && <Spinner size="sm" className="mr-2" />}
                Enviar
              </Button>
            </>
          )}
          {mode === 'view' && (
            <Button type="button" color="blue" onClick={() => navigate('/quick-invoices')}>
              Volver
            </Button>
          )}
        </div>
      </div>

      {apiError && (
        <Alert color="red" onDismiss={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <div className="overflow-hidden rounded-lg border border-border-warm bg-surface shadow-card">
        <InvoiceHeader
          companyName={companyName}
          companyMonogram={companyMonogram}
          ruc={selectedCompany?.ruc ?? selectedRuc ?? '—'}
          address={selectedCompany?.address ?? null}
          contact={contact}
          series={
            invoice
              ? `${invoice.series}-${invoice.sequential}`
              : establishment && emissionPoint
                ? `${establishment.code}-${emissionPoint.code}`
                : '—'
          }
          date={todayDisplay()}
        />

        <IssuerCustomer
          establishments={establishments ?? []}
          emissionPoints={emissionPoints ?? []}
          customers={customers}
          establishmentId={establishmentId}
          emissionPointId={emissionPointId}
          customerId={customerId}
          selectedCustomer={selectedCustomer}
          readonly={isReadonly}
          establishmentsLoading={establishmentsLoading}
          onEstablishmentChange={(v) => {
            setEstablishmentId(v)
            setEmissionPointId('')
          }}
          onEmissionPointChange={setEmissionPointId}
          onCustomerChange={setCustomerId}
        />

        <InvoiceItemsTable
          items={items}
          breakdown={breakdown}
          products={products}
          readonly={isReadonly}
          onAdd={addItem}
          onUpdate={updateItem}
          onRemove={removeItem}
        />

        <InvoiceTotals
          subtotal={subtotal}
          taxGroups={taxGroupList}
          totalDescuento={totalDescuento}
          total={total}
        />

        <InvoicePayments
          payments={payments}
          paymentMethods={paymentMethods}
          total={total}
          readonly={isReadonly}
          onAdd={addPayment}
          onUpdate={updatePayment}
          onRemove={removePayment}
        />

        <InvoiceFooter
          licensePlate={licensePlate}
          additionalInfo={additionalInfo}
          readonly={isReadonly}
          onLicensePlateChange={setLicensePlate}
          onAddInfoRow={addInfoRow}
          onUpdateInfoRow={updateInfoRow}
          onRemoveInfoRow={removeInfoRow}
        />
      </div>

      <ConfirmModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        onConfirm={() => {
          setShowSendConfirm(false)
          handleSend()
        }}
        title="Enviar al SRI"
        message="¿Está seguro de que desea enviar esta factura al SRI?"
        confirmLabel="Enviar"
        confirmColor="blue"
        loading={sendMutation.isPending}
      />
    </div>
  )
}
