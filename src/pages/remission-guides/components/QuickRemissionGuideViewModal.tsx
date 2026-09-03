import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { useCompany } from '../../../hooks/useCompany'
import { useQuickRemissionGuide } from '../../../hooks/useQuickRemissionGuides'
import { formatPrice } from '../../../lib/documents'
import { downloadRide } from '../../../api/quickRemissionGuides'
import { remissionGuideStatusLabel, remissionGuideStatusTone } from '../../../lib/quickRemissionGuides'
import Badge from '../../../components/ui/Badge'
import type { QuickRemissionGuideDestinatario } from '../../../types/api'

interface QuickRemissionGuideViewModalProps {
  guideId: number | null
  onClose: () => void
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return value
}

export default function QuickRemissionGuideViewModal({ guideId, onClose }: QuickRemissionGuideViewModalProps) {
  const { selectedRuc, selectedCompany } = useCompany()
  const { data: guide, isPending } = useQuickRemissionGuide(selectedRuc, guideId)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const companyName = selectedCompany?.business_name || selectedCompany?.name || 'Empresa'
  const companyMonogram = companyName.trim().charAt(0).toUpperCase()
  const contact = [selectedCompany?.phone, selectedCompany?.email].filter(Boolean).join(' · ')

  const canDownloadRide =
    !!guide && guide.document_status === 'AUTHORIZED' && !!guide.access_key

  const handleDownloadRide = async () => {
    if (!guide?.access_key || !selectedRuc) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await downloadRide(guide.access_key, selectedRuc)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `RIDE_${guide.access_key}.pdf`
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
      show={guideId !== null}
      onClose={onClose}
      size="3xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        <span className="flex items-center gap-2">
          Detalle de guía de remisión
          {guide && (
            <Badge tone={remissionGuideStatusTone(guide.status, guide.document_status)}>
              {remissionGuideStatusLabel(guide.status, guide.document_status)}
            </Badge>
          )}
        </span>
      </ModalHeader>
      <ModalBody className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" color="info" />
          </div>
        ) : !guide ? (
          <div className="py-16 text-center text-sm text-muted">No se encontró la guía</div>
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-border-warm p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-white">
                  {companyMonogram}
                </span>
                <div>
                  <div className="text-[14px] font-semibold tracking-tight text-ink">{companyName}</div>
                  <div className="font-mono text-[12px] text-muted">{selectedCompany?.ruc ?? guide.ruc}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="font-mono text-ink">
                  {guide.series}-{guide.sequential}
                </span>
                <span className="text-muted">
                  Fecha emisión: {formatShortDate(guide.emission_date)} · Fecha transporte:{' '}
                  {formatShortDate(guide.fecha_ini_transporte)} a {formatShortDate(guide.fecha_fin_transporte)}
                </span>
              </div>
              {contact && <div className="mt-1 text-[12px] text-faint">{contact}</div>}
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-border-warm p-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Transportista</h3>
                <p className="mt-1 text-[13px] font-medium text-ink">{guide.transportista?.name ?? '—'}</p>
                <p className="text-[13px] text-muted">RUC/ID: {guide.transportista?.identification_number ?? '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <div>
                  <span className="text-[12px] font-medium text-muted">Dir. establecimiento: </span>
                  <span className="text-ink">{guide.dir_establecimiento || '—'}</span>
                </div>
                <div>
                  <span className="text-[12px] font-medium text-muted">Dir. partida: </span>
                  <span className="text-ink">{guide.dir_partida || '—'}</span>
                </div>
                <div>
                  <span className="text-[12px] font-medium text-muted">Placa: </span>
                  <span className="font-mono text-ink">{guide.placa || '—'}</span>
                </div>
              </div>
            </div>

            {(guide.destinatarios ?? []).map((destinatario) => (
              <DestinatarioSection key={destinatario.id} destinatario={destinatario} index={0} />
            ))}

            {Object.keys(guide.additional_info ?? {}).length > 0 && (
              <div className="border-t border-border-warm p-6">
                <h4 className="text-[12px] font-medium text-muted">Información adicional</h4>
                <dl className="mt-1 space-y-1">
                  {Object.entries(guide.additional_info ?? {}).map(([k, v]) => (
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

function DestinatarioSection({ destinatario, index }: { destinatario: QuickRemissionGuideDestinatario; index: number }) {
  const items = destinatario.items ?? []
  return (
    <div key={destinatario.id} className="border-b border-border-warm p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft font-mono text-[11px] font-bold text-accent">
          {index + 1}
        </span>
        <h3 className="text-[13px] font-semibold tracking-tight text-ink">
          {destinatario.razon_social_destinatario || 'Destinatario'}
        </h3>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
        <div>
          <span className="text-[12px] font-medium text-muted">Identificación: </span>
          <span className="font-mono text-ink">{destinatario.identificacion_destinatario}</span>
        </div>
        <div>
          <span className="text-[12px] font-medium text-muted">Dirección: </span>
          <span className="text-ink">{destinatario.dir_destinatario}</span>
        </div>
        <div>
          <span className="text-[12px] font-medium text-muted">Motivo: </span>
          <span className="text-ink">{destinatario.motivo_traslado}</span>
        </div>
        {destinatario.ruta && (
          <div>
            <span className="text-[12px] font-medium text-muted">Ruta: </span>
            <span className="text-ink">{destinatario.ruta}</span>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-2 py-2 font-medium">Descripción</th>
                <th className="px-2 py-2 text-right font-medium">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border-warm align-top last:border-b-0">
                  <td className="px-2 py-2 text-ink">
                    {item.descripcion || item.product_description || `Producto #${item.product_id}`}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-ink">
                    {formatPrice(item.cantidad)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
