import type { Product } from '../../../types/api'
import type { FormGuideItem } from '../remissionGuideForm'

interface DestinatarioItemsTableProps {
  items: FormGuideItem[]
  products: Product[]
  productsById: Map<number, Product>
  readonly: boolean
  onAdd: () => void
  onUpdate: (key: string, patch: Partial<FormGuideItem>) => void
  onRemove: (key: string) => void
}

export default function DestinatarioItemsTable({
  items,
  products,
  productsById,
  readonly,
  onAdd,
  onUpdate,
  onRemove,
}: DestinatarioItemsTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink">Artículos trasladados</span>
        {!readonly && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md border border-border-warm px-2.5 py-1 text-[11px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
          >
            + Agregar artículo
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-warm text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-2 py-2 font-medium">Producto</th>
              <th className="px-2 py-2 font-medium">Cant.</th>
              <th className="px-2 py-2 font-medium">Descripción</th>
              <th className="px-2 py-2 font-medium">C. Interno</th>
              <th className="px-2 py-2 font-medium">C. Adicional</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const product = item.productId ? productsById.get(Number(item.productId)) : undefined
              return (
                <tr key={item.key} className="animate-fade-in border-b border-border-warm last:border-b-0 align-top">
                  <td className="px-2 py-2">
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        onUpdate(item.key, { productId: e.target.value ? Number(e.target.value) : '' })
                      }
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
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={item.descripcion}
                      placeholder={product?.description ?? ''}
                      onChange={(e) => onUpdate(item.key, { descripcion: e.target.value })}
                      disabled={readonly}
                      className="w-full min-w-[180px] rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={item.codigoInterno ?? ''}
                      onChange={(e) => onUpdate(item.key, { codigoInterno: e.target.value })}
                      disabled={readonly}
                      className="w-24 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={item.codigoAdicional ?? ''}
                      onChange={(e) => onUpdate(item.key, { codigoAdicional: e.target.value })}
                      disabled={readonly}
                      className="w-24 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
                    />
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
