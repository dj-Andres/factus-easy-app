import type { InfoRow } from '../remissionGuideForm'

interface GuideFooterProps {
  additionalInfo: InfoRow[]
  readonly: boolean
  onAddInfoRow: () => void
  onUpdateInfoRow: (index: number, patch: Partial<InfoRow>) => void
  onRemoveInfoRow: (index: number) => void
}

export default function GuideFooter({
  additionalInfo,
  readonly,
  onAddInfoRow,
  onUpdateInfoRow,
  onRemoveInfoRow,
}: GuideFooterProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border-warm p-6 sm:grid-cols-2">
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
            <div key={index} className="animate-fade-in flex items-center gap-2">
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
