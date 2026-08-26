import type { BadgeTone } from '../components/ui/Badge'

export function quickInvoiceStatusLabel(status: string, documentStatus?: string | null): string {
  if (status === 'SAVED') return 'Borrador'
  switch (documentStatus) {
    case 'AUTHORIZED':
      return 'Autorizado'
    case 'ANNULLED':
      return 'Anulado'
    case 'REJECTED':
      return 'Rechazado'
    case 'ERROR':
      return 'Error'
    case 'SIGNED':
      return 'Firmado'
    case 'RECEIVED':
      return 'Recibido'
    case 'RETURNED':
      return 'Devuelto'
    default:
      return 'Generado'
  }
}

export function quickInvoiceStatusTone(status: string, documentStatus?: string | null): BadgeTone {
  if (status === 'SAVED') return 'violet'
  switch (documentStatus) {
    case 'AUTHORIZED':
      return 'green'
    case 'ANNULLED':
    case 'REJECTED':
    case 'ERROR':
      return 'red'
    case 'SIGNED':
    case 'RECEIVED':
      return 'blue'
    case 'RETURNED':
      return 'orange'
    default:
      return 'gray'
  }
}
