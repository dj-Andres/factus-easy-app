export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  '01': 'Factura',
  '04': 'Nota de Crédito',
  '06': 'Guía de Remisión',
  '07': 'Retención',
}

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  GENERATED: 'Generado',
  SIGNED: 'Firmado',
  RECEIVED: 'Recibido',
  AUTHORIZED: 'Autorizado',
  REJECTED: 'Rechazado',
  ERROR: 'Error',
  RETURNED: 'Devuelto',
  ANNULLED: 'Anulado',
}

type Tone = 'green' | 'red' | 'blue' | 'orange' | 'gray'

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-600',
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'AUTHORIZED':
      return 'green'
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

export function statusBadgeClass(status: string): string {
  return TONE_CLASSES[statusTone(status)]
}

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
