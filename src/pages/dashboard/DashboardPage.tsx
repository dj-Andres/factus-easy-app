import { Alert, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useCompany } from '../../hooks/useCompany'
import { useDashboardStats } from '../../hooks/useDashboard'
import { DOCUMENT_STATUS_LABELS, formatDate, statusTone } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import type { DashboardTypeStat } from '../../types/api'

interface StatCardProps {
  label: string
  value: number
  hint: string
  accent: string
}

function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border-warm bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={`h-2 w-2 rounded-full ${accent}`} />
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-[11px] text-faint">{hint}</div>
    </div>
  )
}

function byTypeMap(items?: DashboardTypeStat[]): Record<string, DashboardTypeStat> {
  return Object.fromEntries((items ?? []).map((item) => [item.type, item]))
}

export default function DashboardPage() {
  const { selectedRuc, isLoading: loadingCompany } = useCompany()
  const { data, isPending, error, refetch } = useDashboardStats(selectedRuc)

  const byType = byTypeMap(data?.by_type)
  const stats = data?.stats
  const catalogs = data?.catalogs
  const recent = data?.recent ?? []

  const isLoading = loadingCompany || isPending || !selectedRuc

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {selectedRuc ? `Resumen de ${selectedRuc}` : 'Bienvenido'}
          </p>
        </div>
        {error && (
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[13px] font-medium text-accent hover:text-accent-hover"
          >
            Reintentar
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-border-warm bg-surface py-16 shadow-card">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <Alert color="failure" onDismiss={() => refetch()}>
          <span className="font-medium">No se pudieron cargar las estadísticas.</span> Verifica tu conexión e
          inténtalo de nuevo.
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Facturas emitidas"
              value={byType['01']?.month ?? 0}
              hint="Este mes"
              accent="bg-accent"
            />
            <StatCard
              label="Notas de crédito"
              value={byType['04']?.month ?? 0}
              hint="Este mes"
              accent="bg-danger"
            />
            <StatCard
              label="Guías de remisión"
              value={byType['06']?.month ?? 0}
              hint="Este mes"
              accent="bg-warning"
            />
            <StatCard
              label="Retenciones"
              value={byType['07']?.month ?? 0}
              hint="Este mes"
              accent="bg-success"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            <StatCard label="Clientes" value={catalogs?.customers ?? 0} hint="En total" accent="bg-success" />
            <StatCard label="Productos" value={catalogs?.products ?? 0} hint="En total" accent="bg-warning" />
            <StatCard label="Transportistas" value={catalogs?.transporters ?? 0} hint="En total" accent="bg-accent" />
            <StatCard
              label="Documentos emitidos"
              value={stats?.total ?? 0}
              hint={`Autorizados: ${stats?.authorized ?? 0}`}
              accent="bg-danger"
            />
          </div>

          <div className="rounded-lg border border-border-warm bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink">Estado SRI</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className="rounded-lg border border-border-warm bg-canvas p-4">
                <div className="text-[12px] text-muted">Total</div>
                <div className="mt-1 font-mono text-xl font-semibold text-ink">{stats?.total ?? 0}</div>
              </div>
              <div className="rounded-lg border border-border-warm bg-canvas p-4">
                <div className="text-[12px] text-muted">Autorizados</div>
                <div className="mt-1 font-mono text-xl font-semibold text-success">{stats?.authorized ?? 0}</div>
              </div>
              <div className="rounded-lg border border-border-warm bg-canvas p-4">
                <div className="text-[12px] text-muted">Pendientes</div>
                <div className="mt-1 font-mono text-xl font-semibold text-accent">{stats?.pending ?? 0}</div>
              </div>
              <div className="rounded-lg border border-border-warm bg-canvas p-4">
                <div className="text-[12px] text-muted">Rechazados</div>
                <div className="mt-1 font-mono text-xl font-semibold text-warning">{stats?.rejected ?? 0}</div>
              </div>
              <div className="rounded-lg border border-border-warm bg-canvas p-4">
                <div className="text-[12px] text-muted">Errores</div>
                <div className="mt-1 font-mono text-xl font-semibold text-danger">{stats?.errors ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border-warm bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink">Actividad reciente</h2>
            {recent.length === 0 ? (
              <p className="mt-3 text-sm text-faint">
                Aún no hay documentos emitidos. Crea tu primera factura desde el menú de documentos.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <Table hoverable>
                  <TableHead>
                    <TableRow>
                      <TableHeadCell>Tipo</TableHeadCell>
                      <TableHeadCell>Comprobante</TableHeadCell>
                      <TableHeadCell>Clave de acceso</TableHeadCell>
                      <TableHeadCell>Fecha</TableHeadCell>
                      <TableHeadCell>Estado</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent.map((doc) => (
                      <TableRow key={`${doc.type}-${doc.id}`} className="bg-surface">
                        <TableCell className="text-muted">{doc.type_label}</TableCell>
                        <TableCell>
                          <div className="font-mono text-[13px] text-ink">
                            {doc.series}-{doc.sequential}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-[11px] text-faint">{`${doc.access_key.slice(0, 24)}…`}</div>
                        </TableCell>
                        <TableCell className="text-muted">{formatDate(doc.issue_date)}</TableCell>
                        <TableCell>
                          <Badge tone={statusTone(doc.status)}>
                            {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}