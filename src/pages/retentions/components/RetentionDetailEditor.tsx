import type { RetentionConfig } from '../../../types/api'
import type { FormRetentionDetail } from '../retentionForm'
import { SUSTENTO_OPTIONS, configToDetail, round2Str } from '../retentionForm'
import { formatNumDocSustento } from '../../../lib/quickRetentions'
import { parseNum } from '../../../lib/numbers'

interface RetentionDetailEditorProps {
  detail: FormRetentionDetail
  index: number
  configs: RetentionConfig[]
  readonly: boolean
  canRemove: boolean
  onUpdate: (key: string, patch: Partial<FormRetentionDetail>) => void
  onRemove: (key: string) => void
}

const inputClass =
  'w-full rounded-md border border-border-warm bg-canvas px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none disabled:opacity-60'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-faint'

function configLabel(config: RetentionConfig): string {
  return `${config.name} · ${config.percentage}%`
}

export default function RetentionDetailEditor({
  detail,
  index,
  configs,
  readonly,
  canRemove,
  onUpdate,
  onRemove,
}: RetentionDetailEditorProps) {
  const pickConfig = (id: number | '') => {
    if (id === '') {
      onUpdate(detail.key, { retentionConfigId: '', codigo: '1', codigoRetencion: '', descripcion: '', porcentajeRetener: '' })
      if (detail.baseImponible !== '') onUpdate(detail.key, { valorRetenido: '0' })
      return
    }
    const config = configs.find((c) => c.id === id)
    if (!config) return
    const withConfig = configToDetail(config, detail.baseImponible, detail.key)
    onUpdate(detail.key, {
      retentionConfigId: config.id,
      codigo: withConfig.codigo,
      codigoRetencion: withConfig.codigoRetencion,
      descripcion: withConfig.descripcion,
      porcentajeRetener: withConfig.porcentajeRetener,
      valorRetenido: withConfig.valorRetenido,
    })
  }

  const onBaseChange = (value: string) => {
    onUpdate(detail.key, { baseImponible: value })
    const pct = parseNum(detail.porcentajeRetener)
    if (pct > 0) onUpdate(detail.key, { valorRetenido: round2Str((parseNum(value) * pct) / 100) })
  }

  const onPctChange = (value: string) => {
    onUpdate(detail.key, { porcentajeRetener: value })
    const pct = parseNum(value)
    if (pct > 0) onUpdate(detail.key, { valorRetenido: round2Str((parseNum(detail.baseImponible) * pct) / 100) })
  }

  const grouped = configs.reduce<Record<number, RetentionConfig[]>>((acc, c) => {
    ;(acc[c.type] ??= []).push(c)
    return acc
  }, {})

  return (
    <div className="rounded-lg border border-border-warm bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft font-mono text-[11px] font-bold text-accent">
            {index + 1}
          </span>
          <h4 className="text-[13px] font-semibold tracking-tight text-ink">Retención {index + 1}</h4>
        </div>
        {!readonly && canRemove && (
          <button
            type="button"
            onClick={() => onRemove(detail.key)}
            className="rounded-md px-2 py-1 text-[12px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
          >
            Quitar retención
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>Concepto (catálogo)</label>
          <select
            value={detail.retentionConfigId}
            onChange={(e) =>
              pickConfig(e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={readonly}
            className={inputClass}
          >
            <option value="">Libre...</option>
            {Object.entries(grouped).map(([type, items]) => (
              <optgroup key={type} label={type === '1' ? 'Renta' : 'IVA'}>
                {items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {configLabel(c)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipo de impuesto</label>
          <select
            value={detail.codigo}
            onChange={(e) => {
              onUpdate(detail.key, { codigo: e.target.value })
              if (detail.retentionConfigId !== '') onUpdate(detail.key, { retentionConfigId: '' })
            }}
            disabled={readonly}
            className={inputClass}
          >
            <option value="1">1 - Renta</option>
            <option value="2">2 - IVA</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Código retención</label>
          <input
            type="text"
            value={detail.codigoRetencion}
            maxLength={3}
            onChange={(e) => onUpdate(detail.key, { codigoRetencion: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <input
            type="text"
            value={detail.descripcion}
            maxLength={150}
            onChange={(e) => onUpdate(detail.key, { descripcion: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Base imponible</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={detail.baseImponible}
            onChange={(e) => onBaseChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Porcentaje a retener (%)</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={detail.porcentajeRetener}
            onChange={(e) => onPctChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Valor retenido</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={detail.valorRetenido}
            onChange={(e) => onUpdate(detail.key, { valorRetenido: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cód. doc. sustento</label>
          <select
            value={detail.codDocSustento}
            onChange={(e) => onUpdate(detail.key, { codDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          >
            {SUSTENTO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Núm. doc. sustento</label>
          <input
            type="text"
            value={detail.numDocSustento}
            placeholder="000-000-000000000"
            onChange={(e) => onUpdate(detail.key, { numDocSustento: formatNumDocSustento(e.target.value) })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha emisión doc. sustento</label>
          <input
            type="date"
            value={detail.fechaEmisionDocSustento}
            onChange={(e) => onUpdate(detail.key, { fechaEmisionDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}