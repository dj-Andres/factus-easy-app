import { formatDate } from '../../../lib/documents'
import type { QuickInvoice } from '../../../types/api'

interface OriginalInvoiceLookupProps {
  series: string
  sequential: string
  readonly: boolean
  searching: boolean
  invoice: QuickInvoice | null
  error: string | null
  onSeriesChange: (value: string) => void
  onSequentialChange: (value: string) => void
}

export default function OriginalInvoiceLookup({
  series,
  sequential,
  readonly,
  searching,
  invoice,
  error,
  onSeriesChange,
  onSequentialChange,
}: OriginalInvoiceLookupProps) {
  return (
    <div className="border-b border-border-warm p-6">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Factura original</h3>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-muted">Serie</label>
          <input
            type="text"
            value={series}
            onChange={(e) => onSeriesChange(e.target.value)}
            disabled={readonly}
            placeholder="001001"
            maxLength={6}
            className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 font-mono text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-muted">Secuencial</label>
          <input
            type="text"
            value={sequential}
            onChange={(e) => onSequentialChange(e.target.value)}
            disabled={readonly}
            placeholder="000000018"
            maxLength={9}
            className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 font-mono text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {searching && (
        <p className="mt-3 text-[12px] text-muted">Buscando factura…</p>
      )}

      {error && <p className="mt-3 text-[12px] text-danger">{error}</p>}

      {invoice && (
        <div className="mt-3 rounded-md bg-canvas/50 px-3 py-2 text-[12px] text-muted">
          <p>
            <span className="font-medium text-ink">Cliente:</span> {invoice.customer_name ?? '—'}
          </p>
          <p>
            <span className="font-medium text-ink">Fecha:</span> {formatDate(invoice.emission_date)}
          </p>
          <p>
            <span className="font-medium text-ink">Total:</span> ${invoice.total ?? '—'}
          </p>
        </div>
      )}
    </div>
  )
}
