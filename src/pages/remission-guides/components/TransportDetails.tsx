import type { Transporter } from '../../../types/api'

interface TransportDetailsProps {
  transporters: Transporter[]
  transporterId: number | ''
  selectedTransporter: Transporter | null
  dirEstablecimiento: string
  dirPartida: string
  placa: string
  fechaIni: string
  fechaFin: string
  readonly: boolean
  onTransporterChange: (id: number | '') => void
  onDirPartidaChange: (v: string) => void
  onPlacaChange: (v: string) => void
  onFechaIniChange: (v: string) => void
  onFechaFinChange: (v: string) => void
}

const inputClass =
  'w-full rounded-md border border-border-warm bg-canvas px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-faint'
const roClass = 'rounded-md border border-border-warm bg-surface-2 px-2.5 py-1.5 text-[12px] text-muted'

const IDENT_LABELS: Record<string, string> = {
  '04': 'RUC',
  '05': 'Cédula',
  '06': 'Pasaporte',
  '07': 'Consumidor final',
  '08': 'ID exterior',
}

export default function TransportDetails({
  transporters,
  transporterId,
  selectedTransporter,
  dirEstablecimiento,
  dirPartida,
  placa,
  fechaIni,
  fechaFin,
  readonly,
  onTransporterChange,
  onDirPartidaChange,
  onPlacaChange,
  onFechaIniChange,
  onFechaFinChange,
}: TransportDetailsProps) {
  return (
    <div className="border-b border-border-warm p-6">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Datos del transporte</h3>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelClass}>Transportista</label>
          {readonly ? (
            <div className={roClass}>
              {selectedTransporter
                ? `${selectedTransporter.name} · ${IDENT_LABELS[selectedTransporter.identification_type] ?? 'ID'} ${selectedTransporter.identification_number}`
                : '—'}
            </div>
          ) : (
            <select
              value={transporterId}
              onChange={(e) => onTransporterChange(e.target.value ? Number(e.target.value) : '')}
              className={inputClass}
            >
              <option value="">Seleccionar transportista...</option>
              {transporters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.identification_number}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className={labelClass}>Dirección establecimiento</label>
          <div className={roClass} title="Se completa automáticamente desde la empresa">
            {dirEstablecimiento || '—'}
          </div>
        </div>
        <div>
          <label className={labelClass}>Dirección de partida</label>
          <input
            type="text"
            value={dirPartida}
            onChange={(e) => onDirPartidaChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Placa</label>
          <input
            type="text"
            value={placa}
            onChange={(e) => onPlacaChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha inicio transporte</label>
          <input
            type="date"
            value={fechaIni}
            onChange={(e) => onFechaIniChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha fin transporte</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            disabled={readonly}
            className={inputClass}
          />
        </div>

        {selectedTransporter && (
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border-warm bg-canvas px-3 py-2 text-[11px] text-muted">
              <span>
                <span className="font-medium text-faint">RUC/ID: </span>
                <span className="font-mono">{selectedTransporter.identification_number}</span>
              </span>
              <span>
                <span className="font-medium text-faint">Placa base: </span>
                <span className="font-mono">{selectedTransporter.placa}</span>
              </span>
              {selectedTransporter.rise && (
                <span>
                  <span className="font-medium text-faint">RISE: </span>
                  {selectedTransporter.rise}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
