import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: 'blue' | 'red' | 'gray' | 'green' | 'yellow'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmColor = 'blue',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="sm"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">{title}</ModalHeader>
      <ModalBody className="p-4 sm:p-6">
        <p className="text-sm text-muted">{message}</p>
      </ModalBody>
      <ModalFooter className="flex-col-reverse gap-2 border-border-warm sm:flex-row sm:justify-end">
        <Button type="button" color="gray" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button color={confirmColor} className="w-full sm:w-auto" onClick={onConfirm} disabled={loading}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
