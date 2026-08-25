import { useAuthStore } from '../../stores/authStore'

const stats = [
  { label: 'Facturas emitidas', value: '0', hint: 'Este mes', accent: 'bg-accent' },
  { label: 'Notas de crédito', value: '0', hint: 'Este mes', accent: 'bg-danger' },
  { label: 'Clientes', value: '0', hint: 'En total', accent: 'bg-success' },
  { label: 'Productos', value: '0', hint: 'En total', accent: 'bg-warning' },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Bienvenido, <span className="font-medium text-ink">{user?.name ?? user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border-warm bg-surface p-5 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted">{stat.label}</span>
              <span className={`h-2 w-2 rounded-full ${stat.accent}`} />
            </div>
            <div className="mt-3 font-mono text-2xl font-semibold text-ink">{stat.value}</div>
            <div className="mt-1 text-[11px] text-faint">{stat.hint}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border-warm bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink">Actividad reciente</h2>
        <p className="mt-3 text-sm text-faint">
          Aún no hay documentos emitidos. Crea tu primera factura desde el menú de documentos.
        </p>
      </div>
    </div>
  )
}
