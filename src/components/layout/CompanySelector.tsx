import { useState, useRef, useEffect } from 'react'
import { useCompany } from '../../hooks/useCompany'

export default function CompanySelector() {
  const { companies, selectedCompany, setSelectedRuc, isLoading } = useCompany()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (isLoading) {
    return <span className="text-[13px] text-muted">Cargando empresas...</span>
  }

  if (companies.length === 0) {
    return <span className="text-[13px] text-muted">Sin empresas</span>
  }

  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-ink">{selectedCompany?.name ?? selectedCompany?.ruc}</span>
        <span className="font-mono text-[11px] text-faint">{selectedCompany?.ruc}</span>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-surface-2 hover:text-accent"
      >
        <span>{selectedCompany?.name ?? selectedCompany?.ruc ?? 'Seleccionar'}</span>
        <svg
          className={`h-3.5 w-3.5 text-faint transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="animate-slide-down absolute left-0 top-full z-50 mt-1.5 min-w-[260px] rounded-md border border-border-warm bg-surface shadow-pop">
          <div className="px-3 pb-2 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
              Empresas
            </span>
          </div>
          {companies.map((company) => (
            <button
              key={company.ruc}
              type="button"
              onClick={() => {
                setSelectedRuc(company.ruc)
                setOpen(false)
              }}
              className={`flex w-full flex-col px-3 py-2 text-left transition-colors duration-150 hover:bg-surface-2 ${
                company.ruc === selectedCompany?.ruc ? 'bg-accent-soft' : ''
              }`}
            >
              <span className={`text-[13px] font-medium ${company.ruc === selectedCompany?.ruc ? 'text-accent' : 'text-ink'}`}>
                {company.name}
              </span>
              <span className="font-mono text-[11px] text-faint">{company.ruc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
