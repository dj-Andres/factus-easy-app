import type { InfoRow } from '../invoiceForm'

interface InvoiceFooterProps {
  licensePlate: string
  additionalInfo: InfoRow[]
  readonly: boolean
  onLicensePlateChange: (value: string) => void
  onAddInfoRow: () => void
  onUpdateInfoRow: (index: number, patch: Partial<InfoRow>) => void
  onRemoveInfoRow: (index: number) => void
}

export default function InvoiceFooter({
  licensePlate,
  additionalInfo,
  readonly,
  onLicensePlateChange,
  onAddInfoRow,
  onUpdateInfoRow,
  onRemoveInfoRow,
}: InvoiceFooterProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border-warm p-6 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-[12px] font-medium text-muted">Placa (opcional)</label>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => onLicensePlateChange(e.target.value)}
          disabled={readonly}
          placeholder="ABC1234"
          className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="mb-1 block text-[12px] font-medium text-muted">Información adicional</label>
          {!readonly && (
            <button
              type="button"
              onClick={onAddInfoRow}
              className="mb-1 rounded-md border border-border-warm px-2 py-0.5 text-[11px] font-medium text-accent transition-colors duration-150 hover:bg-accent-soft"
            >
              + Agregar
            </button>
          )}
        </div>
        {additionalInfo.length === 0 && <p className="text-[12px] text-faint">Sin información adicional</p>}
        <div className="space-y-2">
          {additionalInfo.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={row.clave}
                onChange={(e) => onUpdateInfoRow(index, { clave: e.target.value })}
                disabled={readonly}
                placeholder="Clave"
                className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
              <input
                type="text"
                value={row.valor}
                onChange={(e) => onUpdateInfoRow(index, { valor: e.target.value })}
                disabled={readonly}
                placeholder="Valor"
                className="w-1/2 rounded-md border border-border-warm bg-canvas px-2 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
              />
              {!readonly && (
                <button
                  type="button"
                  onClick={() => onRemoveInfoRow(index)}
                  className="rounded-md px-2 py-1 text-[13px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
