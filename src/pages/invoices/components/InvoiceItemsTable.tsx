import { formatPrice } from '../../../lib/documents'
import type { Product } from '../../../types/api'
import type { FormItem, ItemBreakdown } from '../invoiceForm'

interface InvoiceItemsTableProps {
  items: FormItem[]
  breakdown: ItemBreakdown[]
  products: Product[]
  readonly: boolean
  onAdd: () => void
  onUpdate: (key: string, patch: Partial<FormItem>) => void
  onRemove: (key: string) => void
  onIceChange: (itemKey: string, taxId: number, value: string) => void
}

export default function InvoiceItemsTable({
  items,
  breakdown,
  products,
  readonly,
  onAdd,
  onUpdate,
  onRemove,
  onIceChange,
}: InvoiceItemsTableProps) {
  return (
    <div className="border-b border-border-warm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Detalle</h3>
        {!readonly && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md border border-border-warm px-3 py-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
          >
            + Agregar producto
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Código</th>
              <th className="px-2 py-2 font-medium">Descripción</th>
              <th className="px-2 py-2 text-right font-medium">Cant.</th>
              <th className="px-2 py-2 text-right font-medium">P. Unitario</th>
              <th className="px-2 py-2 text-right font-medium">ICE /unidad</th>
              <th className="px-2 py-2 text-right font-medium">IRBPNR /unidad</th>
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
                  <td className="px-2 py-2">
                    <select
                      value={item.productId}
                      onChange={(e) => onUpdate(item.key, { productId: e.target.value ? Number(e.target.value) : '' })}
                      disabled={readonly}
                      className="w-full min-w-[180px] rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.description}
                        </option>
                      ))}
                    </select>
                  </td>
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
                    {(() => {
                      const editableTax = b?.taxes.find((t) => t.taxType === 'ICE')
                      if (!editableTax) return null
                      const currentValue = item.iceValues?.[editableTax.taxId] ?? ''
                      return (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={currentValue}
                          onChange={(e) => onIceChange(item.key, editableTax.taxId, e.target.value)}
                          placeholder="$0.00"
                          disabled={readonly}
                          className="w-24 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-right font-mono text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                        />
                      )
                    })()}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {(() => {
                      const editableTax = b?.taxes.find((t) => t.taxType === 'IRBPNR')
                      if (!editableTax) return null
                      const currentValue = item.iceValues?.[editableTax.taxId] ?? ''
                      return (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={currentValue}
                          onChange={(e) => onIceChange(item.key, editableTax.taxId, e.target.value)}
                          placeholder="$0.00"
                          disabled={readonly}
                          className="w-24 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-right font-mono text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                        />
                      )
                    })()}
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
