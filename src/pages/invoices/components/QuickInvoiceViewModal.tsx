import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useCompany } from '../../../hooks/useCompany'
import { useQuickInvoice } from '../../../hooks/useQuickInvoices'
import { formatPrice } from '../../../lib/documents'
import { quickInvoiceStatusLabel, quickInvoiceStatusTone } from '../../../lib/quickInvoices'
import Badge from '../../../components/ui/Badge'
import InvoiceHeader from './InvoiceHeader'
import paymentMethodsJson from '../../../data/paymentMethods.json'
import type { QuickInvoiceItem, QuickInvoicePayment } from '../../../types/api'

const paymentMethods = paymentMethodsJson as { code: string; name: string }[]

interface QuickInvoiceViewModalProps {
  invoiceId: number | null
  onClose: () => void
}

function formatShortDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function paymentName(code: string): string {
  return paymentMethods.find((m) => m.code === code)?.name ?? code
}

function computeItem(item: QuickInvoiceItem) {
  const cantidad = item.cantidad ?? 0
  const precio = item.precio_unitario ?? 0
  const descuento = item.descuento ?? 0
  const base = Math.max(0, cantidad * precio - descuento)
  const totalConImpuestos = item.total_con_impuestos ?? base
  const taxes = item.impuestos ?? []
  return { base, descuento, totalConImpuestos, taxes }
}

function groupTaxes(items: QuickInvoiceItem[]) {
  const map = new Map<string, { key: string; name: string; valor: number }>()
  for (const item of items) {
    for (const t of item.impuestos ?? []) {
      const key = `${t.codigo}-${t.tarifa}`
      const existing = map.get(key)
      if (existing) {
        existing.valor += t.valor
      } else {
        map.set(key, { key, name: `${t.codigo} ${t.tarifa}%`, valor: t.valor })
      }
    }
  }
  return [...map.values()]
}

export default function QuickInvoiceViewModal({ invoiceId, onClose }: QuickInvoiceViewModalProps) {
  const { selectedRuc, selectedCompany } = useCompany()
  const { data: invoice, isPending } = useQuickInvoice(selectedRuc, invoiceId)

  const companyName = selectedCompany?.business_name || selectedCompany?.name || 'Empresa'
  const companyMonogram = companyName.trim().charAt(0).toUpperCase()
  const contact = [selectedCompany?.phone, selectedCompany?.email].filter(Boolean).join(' · ')

  return (
    <Modal
      show={invoiceId !== null}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        <span className="flex items-center gap-2">
          Detalle de factura
          {invoice && (
            <Badge tone={quickInvoiceStatusTone(invoice.status, invoice.document_status)}>
              {quickInvoiceStatusLabel(invoice.status, invoice.document_status)}
            </Badge>
          )}
        </span>
      </ModalHeader>
      <ModalBody className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" color="info" />
          </div>
        ) : !invoice ? (
          <div className="py-16 text-center text-sm text-muted">No se encontró la factura</div>
        ) : (
          <div className="overflow-hidden">
            <InvoiceHeader
              companyName={companyName}
              companyMonogram={companyMonogram}
              ruc={selectedCompany?.ruc ?? invoice.ruc ?? '—'}
              address={selectedCompany?.address ?? null}
              contact={contact}
              series={`${invoice.series}-${invoice.sequential}`}
              date={formatShortDate(invoice.emission_date)}
            />

            <div className="border-b border-border-warm p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Cliente</h3>
              <p className="mt-1 text-[13px] font-medium text-ink">{invoice.customer_name ?? '—'}</p>
              <p className="text-[13px] text-muted">RUC/CI: {invoice.customer_identification ?? '—'}</p>
            </div>

            <InvoiceViewItems items={invoice.items ?? []} />

            <InvoiceViewTotals items={invoice.items ?? []} invoice={invoice} />

            <div className="border-t border-border-warm p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Formas de pago</h3>
              <div className="mt-3 space-y-1.5">
                {resolvePayments(invoice).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px]">
                    <span className="text-muted">
                      [{p.formaPago}] {paymentName(p.formaPago)}
                    </span>
                    <span className="font-mono text-ink">{formatPrice(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {invoice.license_plate || Object.keys(invoice.additional_info ?? {}).length > 0 ? (
              <div className="grid grid-cols-1 gap-4 border-t border-border-warm p-6 sm:grid-cols-2">
                {invoice.license_plate && (
                  <div className="text-[13px]">
                    <span className="text-[12px] font-medium text-muted">Placa: </span>
                    <span className="font-mono text-ink">{invoice.license_plate}</span>
                  </div>
                )}
                {Object.keys(invoice.additional_info ?? {}).length > 0 && (
                  <div>
                    <h4 className="text-[12px] font-medium text-muted">Información adicional</h4>
                    <dl className="mt-1 space-y-1">
                      {Object.entries(invoice.additional_info ?? {}).map(([k, v]) => (
                        <div key={k} className="text-[12px]">
                          <span className="font-medium text-ink">{k}: </span>
                          <span className="text-muted">{v}</span>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </ModalBody>
      <ModalFooter className="border-border-warm">
        <Button type="button" color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

function resolvePayments(invoice: NonNullable<ReturnType<typeof useQuickInvoice>['data']>): QuickInvoicePayment[] {
  if (invoice.formas_pago && invoice.formas_pago.length > 0) return invoice.formas_pago
  return [{ formaPago: invoice.payment_method, total: invoice.total ?? 0 }]
}

function InvoiceViewItems({ items }: { items: QuickInvoiceItem[] }) {
  return (
    <div className="border-b border-border-warm p-6">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Detalle</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Descripción</th>
              <th className="px-2 py-2 text-right font-medium">Cant.</th>
              <th className="px-2 py-2 text-right font-medium">P. Unitario</th>
              <th className="px-2 py-2 text-right font-medium">Desc.</th>
              <th className="px-2 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const c = computeItem(item)
              return (
                <tr key={item.id} className="border-b border-border-warm align-top last:border-b-0">
                  <td className="px-2 py-2 text-ink">{item.product_description ?? `Producto #${item.product_id}`}</td>
                  <td className="px-2 py-2 text-right font-mono text-ink">{item.cantidad}</td>
                  <td className="px-2 py-2 text-right font-mono text-muted">{formatPrice(item.precio_unitario)}</td>
                  <td className="px-2 py-2 text-right font-mono text-muted">
                    {item.descuento ? formatPrice(item.descuento) : '—'}
                  </td>
                  <td className="px-2 py-2 text-right font-mono font-medium text-ink">{formatPrice(c.totalConImpuestos)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoiceViewTotals({
  items,
  invoice,
}: {
  items: QuickInvoiceItem[]
  invoice: { total_sin_impuestos: number | null; total_impuestos: number | null; total_descuento: number | null; total: number | null }
}) {
  const computed = items.map(computeItem)
  const subtotal =
    invoice.total_sin_impuestos ?? computed.reduce((s, c) => s + c.base, 0)
  const totalDescuento =
    invoice.total_descuento ?? computed.reduce((s, c) => s + c.descuento, 0)
  const total = invoice.total ?? computed.reduce((s, c) => s + c.totalConImpuestos, 0)
  const taxGroups = groupTaxes(items)

  return (
    <div className="flex justify-end p-6">
      <dl className="w-full max-w-xs space-y-2 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-mono text-ink">{formatPrice(subtotal)}</dd>
        </div>
        {taxGroups.length > 0
          ? taxGroups.map((g) => (
              <div key={g.key} className="flex justify-between">
                <dt className="text-muted">{g.name}</dt>
                <dd className="font-mono text-ink">{formatPrice(g.valor)}</dd>
              </div>
            ))
          : invoice.total_impuestos != null && (
              <div className="flex justify-between">
                <dt className="text-muted">Impuestos</dt>
                <dd className="font-mono text-ink">{formatPrice(invoice.total_impuestos)}</dd>
              </div>
            )}
        {totalDescuento > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Descuento</dt>
            <dd className="font-mono text-ink">-{formatPrice(totalDescuento)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border-warm pt-2 text-base">
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="font-mono font-bold text-ink">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
