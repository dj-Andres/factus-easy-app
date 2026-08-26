import { Alert, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { useSriTaxes } from '../../hooks/useProducts'
import Badge, { type BadgeTone } from '../../components/ui/Badge'
import type { SriTax } from '../../types/api'

function taxTypeTone(taxType: string): BadgeTone {
  switch (taxType) {
    case 'IVA':
      return 'violet'
    case 'ICE':
      return 'orange'
    case 'IRBPNR':
      return 'green'
    default:
      return 'gray'
  }
}

function formatPercentage(value: number): string {
  return `${value}%`
}

function groupByType(taxes: SriTax[]): Record<string, SriTax[]> {
  return taxes.reduce<Record<string, SriTax[]>>((acc, tax) => {
    ;(acc[tax.tax_type] ??= []).push(tax)
    return acc
  }, {})
}

const TYPE_ORDER = ['IVA', 'ICE', 'IRBPNR']

export default function SriTaxesPage() {
  const { data: taxes, isPending, error } = useSriTaxes()

  const groups = taxes ? groupByType(taxes) : {}
  const groupKeys = taxes
    ? [...TYPE_ORDER.filter((key) => groups[key]), ...Object.keys(groups).filter((key) => !TYPE_ORDER.includes(key))]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Impuestos SRI</h1>
        <p className="mt-1 text-sm text-muted">Catálogo de impuestos del SRI (solo lectura)</p>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        {error && (
          <div className="px-4 pt-4">
            <Alert color="red">No se pudieron cargar los impuestos</Alert>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" color="info" />
          </div>
        ) : !taxes || taxes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-sm text-faint">No hay impuestos registrados</span>
          </div>
        ) : (
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell>Nombre</TableHeadCell>
                <TableHeadCell>Código SRI</TableHeadCell>
                <TableHeadCell>Código %</TableHeadCell>
                <TableHeadCell>Porcentaje</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groupKeys.flatMap((type) => [
                <TableRow key={`header-${type}`} className="bg-surface">
                  <TableCell
                    colSpan={5}
                    className="py-2 text-[11px] font-semibold uppercase tracking-wider text-faint"
                  >
                    {type}
                  </TableCell>
                </TableRow>,
                ...groups[type].map((tax) => (
                  <TableRow key={tax.id} className="bg-surface">
                    <TableCell>
                      <Badge tone={taxTypeTone(tax.tax_type)}>{tax.tax_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-ink">{tax.name}</TableCell>
                    <TableCell className="font-mono text-[13px] text-ink">{tax.sri_code}</TableCell>
                    <TableCell className="font-mono text-[13px] text-muted">{tax.sri_percentage_code}</TableCell>
                    <TableCell className="font-mono text-[13px] text-muted">{formatPercentage(tax.percentage)}</TableCell>
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
