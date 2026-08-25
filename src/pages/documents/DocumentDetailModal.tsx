import { useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useAnnulmentList } from '../../hooks/useAnnulments'
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, formatDate, statusBadgeClass } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import type { DocumentStatus } from '../../types/api'
import AnnulmentModal from './AnnulmentModal'

interface DocumentDetailModalProps {
  document: DocumentStatus | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:justify-between">
      <span className="text-[12px] text-faint">{label}</span>
      <span className="text-[13px] text-ink">{value ?? '—'}</span>
    </div>
  )
}

export default function DocumentDetailModal({ document, onClose }: DocumentDetailModalProps) {
  const [showAnnulment, setShowAnnulment] = useState(false)
  const accessKey = document?.access_key ?? null
  const { data: annulmentList, isPending: annulmentsLoading } = useAnnulmentList(accessKey)

  if (!document) return null

  return (
    <>
      <Modal
        show
        onClose={onClose}
        size="lg"
        className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
      >
        <ModalHeader className="border-border-warm">Detalle del documento</ModalHeader>
        <ModalBody className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Badge tone={document.document_type === '01' ? 'violet' : 'blue'}>
              {DOCUMENT_TYPE_LABELS[document.document_type] ?? document.document_type}
            </Badge>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(document.status)}`}>
              {DOCUMENT_STATUS_LABELS[document.status] ?? document.status}
            </span>
          </div>

          <div className="divide-y divide-border-warm">
            <DetailRow label="Serie / Secuencial" value={`${document.series}-${document.sequential}`} />
            <DetailRow label="Clave de acceso" value={<span className="font-mono break-all">{document.access_key}</span>} />
            <DetailRow label="Fecha de emisión" value={formatDate(document.issue_date)} />
            <DetailRow label="Autorización" value={document.authorization_number ?? '—'} />
            <DetailRow label="Fecha de autorización" value={formatDate(document.authorization_date)} />
            <DetailRow label="Estado" value={DOCUMENT_STATUS_LABELS[document.status] ?? document.status} />
            <DetailRow
              label="Próxima acción"
              value={document.status_info.next_expected_action}
            />
            {document.message && <DetailRow label="Mensaje" value={document.message} />}
            {document.notification_email && <DetailRow label="Email notificación" value={document.notification_email} />}
          </div>

          <div className="mt-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-faint">Anulaciones</h3>
            {annulmentsLoading ? (
              <div className="flex items-center gap-2 py-3 text-sm text-muted">
                <Spinner size="sm" /> Cargando...
              </div>
            ) : !annulmentList || annulmentList.annulments.length === 0 ? (
              <p className="py-3 text-[13px] text-faint">Este documento no tiene anulaciones.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {annulmentList.annulments.map((a) => (
                  <div key={a.id} className="rounded-md border border-border-warm bg-canvas px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] text-ink">{a.verification_code}</span>
                      <Badge tone={a.status === 'AUTHORIZED' || a.status === 'Autorizada' ? 'green' : 'orange'}>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      {a.reason}
                      {a.request_date ? ` · ${a.request_date}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
          <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
            Cerrar
          </Button>
          {document.status === 'AUTHORIZED' && (
            <Button color="red" className="w-full sm:w-auto" onClick={() => setShowAnnulment(true)}>
              Anular documento
            </Button>
          )}
        </ModalFooter>
      </Modal>

      <AnnulmentModal
        isOpen={showAnnulment}
        onClose={() => setShowAnnulment(false)}
        accessKey={document.access_key}
        onSuccess={() => {
          setShowAnnulment(false)
          onClose()
        }}
      />
    </>
  )
}
