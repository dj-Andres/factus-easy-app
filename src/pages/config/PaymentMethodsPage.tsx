import { Alert, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'
import { usePaymentMethods } from '../../hooks/usePaymentMethods'

export default function PaymentMethodsPage() {
  const { data: methods, isPending, error } = usePaymentMethods()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Formas de Pago</h1>
        <p className="mt-1 text-sm text-muted">Catálogo de formas de pago del SRI (solo lectura)</p>
      </div>

      <div className="rounded-lg border border-border-warm bg-surface shadow-card">
        {error && (
          <div className="px-4 pt-4">
            <Alert color="red">No se pudieron cargar las formas de pago</Alert>
          </div>
        )}

        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" color="info" />
          </div>
        ) : !methods || methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-sm text-faint">No hay formas de pago registradas</span>
          </div>
        ) : (
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Código</TableHeadCell>
                <TableHeadCell>Nombre</TableHeadCell>
                <TableHeadCell>Descripción</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.code} className="bg-surface">
                  <TableCell className="font-mono text-[13px] text-ink">{method.code}</TableCell>
                  <TableCell className="font-medium text-ink">{method.name}</TableCell>
                  <TableCell className="text-muted">{method.description || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
