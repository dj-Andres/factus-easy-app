import { useState } from 'react'
import { Alert, Button, HelperText, Label, Modal, ModalBody, ModalFooter, ModalHeader, Select, Spinner, Textarea } from 'flowbite-react'
import { useRequestAnnulment } from '../../hooks/useAnnulments'
import { toErrorMessage } from '../../lib/errors'
import type { AnnulmentReason } from '../../types/api'

const REASONS: { value: AnnulmentReason; label: string }[] = [
  { value: 'ERROR_IN_ISSUANCE', label: 'Error en la emisión' },
  { value: 'OPERATION_NOT_REALIZED', label: 'Operación no realizada' },
  { value: 'OTHERS', label: 'Otros' },
]

interface AnnulmentModalProps {
  isOpen: boolean
  onClose: () => void
  accessKey: string
  onSuccess: () => void
}

export default function AnnulmentModal({ isOpen, onClose, accessKey, onSuccess }: AnnulmentModalProps) {
  const mutation = useRequestAnnulment()
  const [reason, setReason] = useState<AnnulmentReason>('ERROR_IN_ISSUANCE')
  const [justification, setJustification] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    mutation.mutate(
      { accessKey, data: { reason, justification: justification || undefined } },
      {
        onSuccess: () => {
          setJustification('')
          onSuccess()
        },
        onError: (err) => setError(toErrorMessage(err)),
      },
    )
  }

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="md"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">Anular documento</ModalHeader>
      <ModalBody className="p-4 sm:p-6">
        {error && (
          <Alert color="red" className="mb-4" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div>
          <div className="mb-2 block">
            <Label htmlFor="reason">Motivo de anulación</Label>
          </div>
          <Select id="reason" value={reason} onChange={(e) => setReason(e.target.value as AnnulmentReason)}>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4">
          <div className="mb-2 block">
            <Label htmlFor="justification">Justificación (opcional)</Label>
          </div>
          <Textarea
            id="justification"
            rows={3}
            maxLength={1000}
            placeholder="Motivo de la anulación"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
          <HelperText>Máximo 1000 caracteres</HelperText>
        </div>
      </ModalBody>
      <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
        <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="red" className="w-full sm:w-auto" onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending && <Spinner size="sm" className="mr-2" />}
          Confirmar anulación
        </Button>
      </ModalFooter>
    </Modal>
  )
}
