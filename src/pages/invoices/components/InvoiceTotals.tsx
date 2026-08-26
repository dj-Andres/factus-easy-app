import { formatPrice } from '../../../lib/documents'
import type { TaxGroup } from '../invoiceForm'

interface InvoiceTotalsProps {
  subtotal: number
  taxGroups: TaxGroup[]
  totalDescuento: number
  total: number
}

export default function InvoiceTotals({ subtotal, taxGroups, totalDescuento, total }: InvoiceTotalsProps) {
  return (
    <div className="flex justify-end p-6">
      <dl className="w-full max-w-xs space-y-2 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-mono text-ink">{formatPrice(subtotal)}</dd>
        </div>
        {taxGroups.map((g) => (
          <div key={g.name} className="flex justify-between">
            <dt className="text-muted">{g.name}</dt>
            <dd className="font-mono text-ink">{formatPrice(g.valor)}</dd>
          </div>
        ))}
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
