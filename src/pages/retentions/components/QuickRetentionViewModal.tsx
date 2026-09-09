import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { useCompany } from '../../../hooks/useCompany'
import { useQuickRetention } from '../../../hooks/useQuickRetentions'
import { formatPrice } from '../../../lib/documents'
import { downloadRide } from '../../../api/quickRetentions'
import { retentionStatusLabel, retentionStatusTone } from '../../../lib/quickRetentions'
import Badge from '../../../components/ui/Badge'
import type { QuickRetentionDetail } from '../../../types/api'

interface QuickRetentionViewModalProps {
  retentionId: number | null
  onClose: () => void
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return value
}

export default function QuickRetentionViewModal({ retentionId, onClose }: QuickRetentionViewModalProps) {
  const { selectedRuc, selectedCompany } = useCompany()
  const { data: retention, isPending } = useQuickRetention(selectedRuc, retentionId)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const companyName = selectedCompany?.business_name || selectedCompany?.name || 'Empresa'
  const companyMonogram = companyName.trim().charAt(0).toUpperCase()
  const contact = [selectedCompany?.phone, selectedCompany?.email].filter(Boolean).join(' · ')

  const canDownloadRide =
    !!retention && retention.document_status === 'AUTHORIZED' && !!retention.access_key

  const handleDownloadRide = async () => {
    if (!retention?.access_key || !selectedRuc) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await downloadRide(retention.access_key, selectedRuc)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `RIDE_${retention.access_key}.pdf`
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
      show={retentionId !== null}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        <span className="flex items-center gap-2">
          Detalle de retención
          {retention && (
            <Badge tone={retentionStatusTone(retention.status, retention.document_status)}>
              {retentionStatusLabel(retention.status, retention.document_status)}
            </Badge>
          )}
        </span>
      </ModalHeader>
      <ModalBody className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" color="info" />
          </div>
        ) : !retention ? (
          <div className="py-16 text-center text-sm text-muted">No se encontró la retención</div>
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-border-warm p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-white">
                  {companyMonogram}
                </span>
                <div>
                  <div className="text-[14px] font-semibold tracking-tight text-ink">{companyName}</div>
                  <div className="font-mono text-[12px] text-muted">{selectedCompany?.ruc ?? retention.ruc}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="font-mono text-ink">
                  {retention.series}-{retention.sequential}
                </span>
                <span className="text-muted">
                  Fecha emisión: {formatShortDate(retention.emission_date)} · Periodo: {retention.periodo_fiscal}
                </span>
              </div>
              {contact && <div className="mt-1 text-[12px] text-faint">{contact}</div>}
            </div>

            <div className="border-b border-border-warm p-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Sujeto retenido</h3>
              <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
                <div>
                  <span className="text-[12px] font-medium text-muted">Razón social: </span>
                  <span className="text-ink">{retention.razon_social_sujeto_retenido}</span>
                </div>
                <div>
                  <span className="text-[12px] font-medium text-muted">Identificación: </span>
                  <span className="font-mono text-ink">{retention.identificacion_sujeto_retenido}</span>
                </div>
                {retention.direccion_sujeto_retenido && (
                  <div className="sm:col-span-2">
                    <span className="text-[12px] font-medium text-muted">Dirección: </span>
                    <span className="text-ink">{retention.direccion_sujeto_retenido}</span>
                  </div>
                )}
              </div>
            </div>

            <DetailsTable details={retention.details ?? []} />

            {retention.additional_info && Object.keys(retention.additional_info).length > 0 && (
              <div className="border-t border-border-warm p-6">
                <h4 className="text-[12px] font-medium text-muted">Información adicional</h4>
                <dl className="mt-1 space-y-1">
                  {Object.entries(retention.additional_info).map(([k, v]) => (
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

function DetailsTable({ details }: { details: QuickRetentionDetail[] }) {
  const total = details.reduce((acc, d) => acc + d.valor_retenido, 0)
  return (
    <div className="p-6">
      <h4 className="text-[12px] font-medium text-muted">Retenciones</h4>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Código</th>
              <th className="px-2 py-2 font-medium">Descripción</th>
              <th className="px-2 py-2 text-right font-medium">Base</th>
              <th className="px-2 py-2 text-right font-medium">%</th>
              <th className="px-2 py-2 text-right font-medium">Valor</th>
              <th className="px-2 py-2 font-medium">Doc. sustento</th>
            </tr>
          </thead>
          <tbody>
            {details.map((d) => (
              <tr key={d.id} className="border-b border-border-warm align-top last:border-b-0">
                <td className="px-2 py-2 font-mono text-ink">
                  {d.codigo === '1' ? 'R' : 'I'}{d.codigo_retencion}
                </td>
                <td className="px-2 py-2 text-ink">{d.descripcion || '—'}</td>
                <td className="px-2 py-2 text-right font-mono text-ink">{formatPrice(d.base_imponible)}</td>
                <td className="px-2 py-2 text-right font-mono text-ink">{d.porcentaje_retener}%</td>
                <td className="px-2 py-2 text-right font-mono text-ink">{formatPrice(d.valor_retenido)}</td>
                <td className="px-2 py-2 font-mono text-muted">
                  {d.num_doc_sustento} · {formatShortDate(d.fecha_emision_doc_sustento)}
                </td>
              </tr>
            ))}
          </tbody>
          {details.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={4} className="px-2 py-2 text-right text-[12px] font-semibold text-ink">
                  Total retenido
                </td>
                <td className="px-2 py-2 text-right font-mono text-[13px] font-bold text-ink">
                  {formatPrice(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}