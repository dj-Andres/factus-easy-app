import { Alert, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useRetentionConfigs } from '../../hooks/useRetentionConfigs'
import Badge, { type BadgeTone } from '../../components/ui/Badge'
import type { RetentionConfig } from '../../types/api'

function typeLabel(type: number): string {
  switch (type) {
    case 1:
      return 'Renta'
    case 2:
      return 'IVA'
    default:
      return `Tipo ${type}`
  }
}

function typeTone(type: number): BadgeTone {
  switch (type) {
    case 1:
      return 'violet'
    case 2:
      return 'orange'
    default:
      return 'gray'
  }
}

function formatPercentage(value: number): string {
  return `${value}%`
}

const TYPE_ORDER = [1, 2]

export default function RetentionConfigsPage() {
  const { data: retentions, isPending, error } = useRetentionConfigs()

  const groups = retentions
    ? retentions.reduce<Record<number, RetentionConfig[]>>((acc, item) => {
        ;(acc[item.type] ??= []).push(item)
        return acc
      }, {})
    : {}
  const groupKeys = retentions
    ? [...TYPE_ORDER.filter((key) => groups[key]), ...Object.keys(groups).map(Number).filter((key) => !TYPE_ORDER.includes(key))]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Retenciones</h1>
        <p className="mt-1 text-sm text-muted">Catálogo de retenciones del SRI (solo lectura)</p>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        {error && (
          <div className="px-4 pt-4">
            <Alert color="red">No se pudieron cargar las retenciones</Alert>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" color="info" />
          </div>
        ) : !retentions || retentions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-sm text-faint">No hay retenciones registradas</span>
          </div>
        ) : (
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell>Nombre</TableHeadCell>
                <TableHeadCell>Código SRI</TableHeadCell>
                <TableHeadCell>Porcentaje</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupKeys.flatMap((type) => [
                <TableRow key={`header-${type}`} className="bg-surface">
                  <TableCell
                    colSpan={4}
                    className="py-2 text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {typeLabel(type)}
                  </TableCell>
                </TableRow>,
                ...groups[type].map((item) => (
                  <TableRow key={`${item.code_sri}-${item.name}`} className="bg-surface">
                    <TableCell>
                      <Badge tone={typeTone(item.type)}>{typeLabel(item.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-ink">{item.name}</TableCell>
                    <TableCell className="font-mono text-[13px] text-muted">{item.code_sri}</TableCell>
                    <TableCell className="font-mono text-[13px] text-muted">
                      {formatPercentage(item.percentage)}
                    </TableCell>
                  </TableRow>
                )),
              ])}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
