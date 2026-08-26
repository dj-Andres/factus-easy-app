import type { CompanyEstablishment, CompanyEmissionPoint, Customer } from '../../../types/api'

interface IssuerCustomerProps {
  establishments: CompanyEstablishment[]
  emissionPoints: CompanyEmissionPoint[]
  customers: Customer[]
  establishmentId: number | ''
  emissionPointId: number | ''
  customerId: number | ''
  selectedCustomer: Customer | null
  readonly: boolean
  establishmentsLoading: boolean
  onEstablishmentChange: (id: number | '') => void
  onEmissionPointChange: (id: number | '') => void
  onCustomerChange: (id: number | '') => void
}

export default function IssuerCustomer({
  establishments,
  emissionPoints,
  customers,
  establishmentId,
  emissionPointId,
  customerId,
  selectedCustomer,
  readonly,
  establishmentsLoading,
  onEstablishmentChange,
  onEmissionPointChange,
  onCustomerChange,
}: IssuerCustomerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-border-warm p-6 sm:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Emisor</h3>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-muted">Establecimiento</label>
          <select
            value={establishmentId}
            onChange={(e) => onEstablishmentChange(e.target.value ? Number(e.target.value) : '')}
            disabled={readonly || establishmentsLoading}
            className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {establishments.map((e) => (
              <option key={e.id} value={e.id}>
                {e.code} - {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-muted">Punto de emisión</label>
          <select
            value={emissionPointId}
            onChange={(e) => onEmissionPointChange(e.target.value ? Number(e.target.value) : '')}
            disabled={readonly || establishmentId === ''}
            className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {emissionPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Cliente</h3>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-muted">Razón social / Nombre</label>
          <select
            value={customerId}
            onChange={(e) => onCustomerChange(e.target.value ? Number(e.target.value) : '')}
            disabled={readonly}
            className="w-full rounded-md border border-border-warm bg-canvas px-3 py-2 text-[13px] text-ink focus:border-accent focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.identification_number})
              </option>
            ))}
          </select>
        </div>
        {selectedCustomer && (
          <div className="rounded-md bg-canvas/50 px-3 py-2 text-[12px] text-muted">
            <p>
              <span className="font-medium text-ink">RUC/CI:</span> {selectedCustomer.identification_number}
            </p>
            {selectedCustomer.address && (
              <p>
                <span className="font-medium text-ink">Dirección:</span> {selectedCustomer.address}
              </p>
            )}
            {(selectedCustomer.phone || selectedCustomer.email) && (
              <p>
                <span className="font-medium text-ink">Contacto:</span>{' '}
                {[selectedCustomer.phone, selectedCustomer.email].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
