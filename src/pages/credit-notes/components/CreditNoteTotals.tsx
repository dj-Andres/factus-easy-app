import { formatPrice } from '../../../lib/documents'

interface CreditNoteTotalsProps {
  baseImponible: number
  subtotalIva: number
  subtotalCero: number
  totalDescuento: number
  iva: number
  ice: number
  total: number
}

export default function CreditNoteTotals({
  baseImponible,
  subtotalIva,
  subtotalCero,
  totalDescuento,
  iva,
  ice,
  total,
}: CreditNoteTotalsProps) {
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
        <div className="flex justify-between">
          <dt className="text-muted">IVA</dt>
          <dd className="font-mono text-ink">{formatPrice(iva)}</dd>
        </div>
        <div className="flex justify-between border-t border-border-warm pt-2 text-base">
          <dt className="font-semibold text-ink">Total</dt>
          <dd key={total} className="animate-highlight rounded font-mono font-bold text-ink">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
