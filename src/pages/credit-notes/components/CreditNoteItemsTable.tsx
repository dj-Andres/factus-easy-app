import { formatPrice } from '../../../lib/documents'
import type { CreditNoteFormItem, CreditNoteItemBreakdown } from '../quickCreditNoteForm'

interface CreditNoteItemsTableProps {
  items: CreditNoteFormItem[]
  breakdown: CreditNoteItemBreakdown[]
  readonly: boolean
  onUpdate: (key: string, patch: Partial<CreditNoteFormItem>) => void
  onRemove: (key: string) => void
}

export default function CreditNoteItemsTable({
  items,
  breakdown,
  readonly,
  onUpdate,
  onRemove,
}: CreditNoteItemsTableProps) {
  return (
    <div className="border-b border-border-warm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Detalle</h3>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Código</th>
              <th className="px-2 py-2 font-medium">Descripción</th>
              <th className="px-2 py-2 text-right font-medium">Cant.</th>
              <th className="px-2 py-2 text-right font-medium">P. Unitario</th>
              <th className="px-2 py-2 text-right font-medium">Desc.</th>
              <th className="px-2 py-2 text-right font-medium">Total</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const b = breakdown[index]
              return (
                <tr key={item.key} className="animate-fade-in border-b border-border-warm last:border-b-0 align-top">
                  <td className="px-2 py-2 align-middle">
                    {b?.product ? (
                      <span className="font-mono text-muted">{b.product.auxiliary_code ?? b.product.id}</span>
                    ) : (
                      <span className="font-mono text-faint">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-ink">{b?.product?.description ?? '—'}</td>
                  <td className="px-2 py-2 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.cantidad}
                      onChange={(e) => onUpdate(item.key, { cantidad: e.target.value })}
                      disabled={readonly}
                      className="w-16 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-right font-mono text-[12px] text-ink focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.precioUnitario}
                      placeholder={b?.product ? String(b.product.unit_price) : ''}
                      onChange={(e) => onUpdate(item.key, { precioUnitario: e.target.value })}
                      disabled={readonly}
                      className="w-24 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-right font-mono text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.descuento}
                      onChange={(e) => onUpdate(item.key, { descuento: e.target.value })}
                      disabled={readonly}
                      className="w-20 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-right font-mono text-[12px] text-ink focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2 text-right align-middle">
                    <span className="font-mono font-medium text-ink">{formatPrice(b?.total ?? 0)}</span>
                    {b && b.taxes.length > 0 && (
                      <div className="mt-0.5 font-mono text-[10px] text-muted">
                        {b.taxes.map((t) => `${t.name}: ${formatPrice(t.valor)}`).join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="px-1 py-2 text-right">
                    {!readonly && items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemove(item.key)}
                        className="rounded-md px-1.5 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
