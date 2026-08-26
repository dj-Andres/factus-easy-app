interface InvoiceHeaderProps {
  companyName: string
  companyMonogram: string
  ruc: string
  address: string | null
  contact: string
  series: string
  date: string
}

export default function InvoiceHeader({
  companyName,
  companyMonogram,
  ruc,
  address,
  contact,
  series,
  date,
}: InvoiceHeaderProps) {
  return (
    <div className="border-b border-border-warm p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent-soft text-lg font-semibold text-accent">
            {companyMonogram}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink">{companyName}</p>
            <p className="text-[12px] text-muted">RUC: {ruc}</p>
            {address && <p className="text-[12px] text-muted">{address}</p>}
            {contact && <p className="text-[12px] text-muted">{contact}</p>}
          </div>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="text-lg font-bold tracking-tight text-ink">FACTURA ELECTRÓNICA</p>
          <div className="mt-2 space-y-1 text-[12px] text-muted">
            <p>
              <span className="font-medium text-ink">Serie:</span> {series}
            </p>
            <p>
              <span className="font-medium text-ink">Fecha:</span> {date}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
