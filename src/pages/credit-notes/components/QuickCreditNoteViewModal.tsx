import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { useCompany } from '../../../hooks/useCompany'
import { useQuickCreditNote } from '../../../hooks/useQuickCreditNotes'
import { formatPrice } from '../../../lib/documents'
import { downloadRide } from '../../../api/quickCreditNotes'
import { quickCreditNoteStatusLabel, quickCreditNoteStatusTone, creditNoteTypeLabel } from '../../../lib/quickCreditNotes'
import Badge from '../../../components/ui/Badge'
import InvoiceHeader from '../../invoices/components/InvoiceHeader'
import type { QuickCreditNoteItem } from '../../../types/api'

interface QuickCreditNoteViewModalProps {
  creditNoteId: number | null
  onClose: () => void
}

function formatShortDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function computeItem(item: QuickCreditNoteItem) {
  const cantidad = item.cantidad ?? 0
  const precio = item.precio_unitario ?? 0
  const descuento = item.descuento ?? 0
  const base = Math.max(0, cantidad * precio - descuento)
  const totalConImpuestos = item.total_con_impuestos ?? base
  const taxes = item.impuestos ?? []
  return { base, descuento, totalConImpuestos, taxes }
}

export default function QuickCreditNoteViewModal({ creditNoteId, onClose }: QuickCreditNoteViewModalProps) {
  const { selectedRuc, selectedCompany } = useCompany()
  const { data: creditNote, isPending } = useQuickCreditNote(selectedRuc, creditNoteId)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const companyName = selectedCompany?.business_name || selectedCompany?.name || 'Empresa'
  const companyMonogram = companyName.trim().charAt(0).toUpperCase()
  const contact = [selectedCompany?.phone, selectedCompany?.email].filter(Boolean).join(' · ')

  const canDownloadRide =
    !!creditNote && creditNote.document_status === 'AUTHORIZED' && !!creditNote.access_key

  const handleDownloadRide = async () => {
    if (!creditNote?.access_key || !selectedRuc) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await downloadRide(creditNote.access_key, selectedRuc)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `RIDE_${creditNote.access_key}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setDownloadError('No se pudo descargar el RIDE.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Modal
      show={creditNoteId !== null}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        <span className="flex items-center gap-2">
          Detalle de nota de crédito
          {creditNote && (
            <Badge tone={quickCreditNoteStatusTone(creditNote.status, creditNote.document_status)}>
              {quickCreditNoteStatusLabel(creditNote.status, creditNote.document_status)}
            </Badge>
          )}
        </span>
      </ModalHeader>
      <ModalBody className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" color="info" />
          </div>
        ) : !creditNote ? (
          <div className="py-16 text-center text-sm text-muted">No se encontró la nota de crédito</div>
        ) : (
          <div className="overflow-hidden">
            <InvoiceHeader
              companyName={companyName}
              companyMonogram={companyMonogram}
              ruc={selectedCompany?.ruc ?? creditNote.ruc ?? '—'}
              address={selectedCompany?.address ?? null}
              contact={contact}
              series={`${creditNote.series}-${creditNote.sequential}`}
              date={formatShortDate(creditNote.emission_date)}
            />

            <div className="grid grid-cols-1 gap-4 border-b border-border-warm p-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Tipo</h3>
                <p className="mt-1 text-[13px] text-ink">{creditNoteTypeLabel(creditNote.credit_note_type)}</p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Motivo</h3>
                <p className="mt-1 text-[13px] text-muted">{creditNote.motivo}</p>
              </div>
            </div>

            <div className="border-b border-border-warm p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Factura original</h3>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                <span className="font-mono text-ink">
                  {creditNote.original_invoice_series}-{creditNote.original_invoice_sequential}
                </span>
                {creditNote.original_invoice_date && (
                  <span className="text-muted">{formatShortDate(creditNote.original_invoice_date)}</span>
                )}
              </div>
            </div>

            <div className="border-b border-border-warm p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Cliente</h3>
              <p className="mt-1 text-[13px] font-medium text-ink">{creditNote.customer_name ?? '—'}</p>
              <p className="text-[13px] text-muted">RUC/CI: {creditNote.customer_identification ?? '—'}</p>
            </div>

            <CreditNoteViewItems items={creditNote.items ?? []} />

            <CreditNoteViewTotals items={creditNote.items ?? []} creditNote={creditNote} />

            {Object.keys(creditNote.additional_info ?? {}).length > 0 && (
              <div className="border-t border-border-warm p-6">
                <h4 className="text-[12px] font-medium text-muted">Información adicional</h4>
                <dl className="mt-1 space-y-1">
                  {Object.entries(creditNote.additional_info ?? {}).map(([k, v]) => (
                    <div key={k} className="text-[12px]">
                      <span className="font-medium text-ink">{k}: </span>
                      <span className="text-muted">{v}</span>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter className="border-border-warm">
        {downloadError && <span className="text-sm text-danger">{downloadError}</span>}
        {canDownloadRide && (
          <Button type="button" color="blue" onClick={handleDownloadRide} disabled={downloading}>
            {downloading && <Spinner size="sm" className="mr-2" />}
            Descargar RIDE
          </Button>
        )}
        <Button type="button" color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  )
}

function CreditNoteViewItems({ items }: { items: QuickCreditNoteItem[] }) {
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

function CreditNoteViewTotals({
  items,
  creditNote,
}: {
  items: QuickCreditNoteItem[]
  creditNote: {
    total_sin_impuestos: number | null
    total_impuestos: number | null
    total_descuento: number | null
    total: number | null
  }
}) {
  const computed = items.map(computeItem)
  const baseImponible =
    creditNote.total_sin_impuestos ?? computed.reduce((s, c) => s + c.base, 0)
  const subtotalIva = items.reduce((s, item) => {
    const c = computeItem(item)
    const hasIva = (item.impuestos ?? []).some((t) => t.codigo === '2' && t.tarifa > 0)
    return hasIva ? s + c.base : s
  }, 0)
  const subtotalCero = items.reduce((s, item) => {
    const c = computeItem(item)
    const hasIva = (item.impuestos ?? []).some((t) => t.codigo === '2' && t.tarifa > 0)
    return hasIva ? s : s + c.base
  }, 0)
  const totalDescuento =
    creditNote.total_descuento ?? computed.reduce((s, c) => s + c.descuento, 0)
  const iva = items.reduce(
    (s, item) => s + (item.impuestos ?? []).filter((t) => t.codigo === '2').reduce((a, t) => a + t.valor, 0),
    0,
  )
  const ice = items.reduce(
    (s, item) => s + (item.impuestos ?? []).filter((t) => t.codigo === '3').reduce((a, t) => a + t.valor, 0),
    0,
  )
  const irbpnr = items.reduce(
    (s, item) => s + (item.impuestos ?? []).filter((t) => t.codigo === '5').reduce((a, t) => a + t.valor, 0),
    0,
  )
  const total = creditNote.total ?? computed.reduce((s, c) => s + c.totalConImpuestos, 0)

  return (
    <div className="flex justify-end p-6">
      <dl className="w-full max-w-xs space-y-2 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Base imponible</dt>
          <dd className="font-mono text-ink">{formatPrice(baseImponible)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal IVA</dt>
          <dd className="font-mono text-ink">{formatPrice(subtotalIva)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal 0</dt>
          <dd className="font-mono text-ink">{formatPrice(subtotalCero)}</dd>
        </div>
        {totalDescuento > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Descuento</dt>
            <dd className="font-mono text-ink">-{formatPrice(totalDescuento)}</dd>
          </div>
        )}
        {ice > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">ICE</dt>
            <dd className="font-mono text-ink">{formatPrice(ice)}</dd>
          </div>
        )}
        {irbpnr > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">IRBPNR</dt>
            <dd className="font-mono text-ink">{formatPrice(irbpnr)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">IVA</dt>
          <dd className="font-mono text-ink">{formatPrice(iva)}</dd>
        </div>
        <div className="flex justify-between border-t border-border-warm pt-2 text-base">
          <dt className="font-semibold text-ink">Valor total</dt>
          <dd className="font-mono font-bold text-ink">{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
