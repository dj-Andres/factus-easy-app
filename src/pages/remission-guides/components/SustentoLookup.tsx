import { useState } from 'react'
import { lookupAuthorizedDocument, type AuthorizedDocumentLookup } from '../../../api/quickRemissionGuides'
import { ApiError } from '../../../api/client'

interface SustentoLookupProps {
  ruc: string
  readonly: boolean
  onResult: (result: AuthorizedDocumentLookup) => void
}

const inputClass =
  'w-full rounded-md border border-border-warm bg-canvas px-2.5 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-60'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-faint'

export default function SustentoLookup({ ruc, readonly, onResult }: SustentoLookupProps) {
  const [series, setSeries] = useState('')
  const [sequential, setSequential] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSearch = series.trim().length > 0 && sequential.trim().length > 0 && !readonly

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    setError(null)
    try {
      const result = await lookupAuthorizedDocument(ruc, series.trim(), sequential.trim())
      onResult(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo buscar la factura autorizada.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border border-dashed border-border-warm bg-canvas/40 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Buscar factura autorizada</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Serie</label>
          <input
            type="text"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            disabled={readonly}
            placeholder="001001"
            maxLength={6}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Secuencial</label>
          <input
            type="text"
            value={sequential}
            onChange={(e) => setSequential(e.target.value)}
            disabled={readonly}
            placeholder="000000018"
            maxLength={9}
            className={inputClass}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSearch}
        disabled={!canSearch || loading}
        className="mt-2 rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Buscando…' : 'Buscar factura'}
      </button>
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </div>
  )
}
