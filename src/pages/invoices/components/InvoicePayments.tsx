import { formatPrice } from '../../../lib/documents'
import { lastPaymentAuto } from '../invoiceForm'
import type { FormPayment } from '../invoiceForm'

interface InvoicePaymentsProps {
  payments: FormPayment[]
  paymentMethods: { code: string; name: string }[]
  total: number
  readonly: boolean
  onAdd: () => void
  onUpdate: (key: string, patch: Partial<FormPayment>) => void
  onRemove: (key: string) => void
}

export default function InvoicePayments({
  payments,
  paymentMethods,
  total,
  readonly,
  onAdd,
  onUpdate,
  onRemove,
}: InvoicePaymentsProps) {
  const auto = lastPaymentAuto(payments, total)

  return (
    <div className="border-t border-border-warm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Formas de pago</h3>
        {!readonly && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md border border-border-warm px-3 py-1 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
          >
            + Agregar pago
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {payments.map((p, index) => {
          const isLast = index === payments.length - 1
          return (
            <div key={p.key} className="flex items-center gap-2">
              <select
                value={p.formaPago}
                onChange={(e) => onUpdate(p.key, { formaPago: e.target.value })}
                disabled={readonly}
                className="max-w-sm flex-1 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
              >
                {paymentMethods.map((m) => (
                  <option key={m.code} value={m.code}>
                    [{m.code}] {m.name}
                  </option>
                ))}
              </select>
              {isLast ? (
                <div
                  className={`flex w-44 items-center justify-end gap-1.5 rounded-md border border-border-warm bg-canvas px-2 py-1.5 font-mono text-[12px] ${
                    auto < 0 ? 'text-danger' : 'text-ink'
                  }`}
                >
                  <span className="text-[10px] font-normal text-faint">auto</span>
                  <span>{formatPrice(auto)}</span>
                </div>
              ) : (
                <div className="relative w-32">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-muted">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={p.total}
                    placeholder="0.00"
                    onChange={(e) => onUpdate(p.key, { total: e.target.value })}
                    disabled={readonly}
                    className="w-full rounded-md border border-border-warm bg-canvas py-1.5 pl-6 pr-2 text-right font-mono text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                  />
                </div>
              )}
              {!readonly && payments.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(p.key)}
                  className="rounded-md px-2 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border-warm pt-2 text-[12px]">
        <span className="text-muted">Total factura</span>
        <div className="flex items-center gap-3">
          {auto < 0 ? (
            <span className="font-medium text-danger">Excede en {formatPrice(-auto)}</span>
          ) : (
            <span className="font-medium text-emerald-700">Cuadra con el total</span>
          )}
          <span className="font-mono font-medium text-ink">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
