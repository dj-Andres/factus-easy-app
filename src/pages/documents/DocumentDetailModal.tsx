import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'flowbite-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import { getDocumentDetail } from '../../api/documents'
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, formatDate, formatPrice, statusBadgeClass } from '../../lib/documents'
import Badge from '../../components/ui/Badge'
import type { DocumentStatus } from '../../types/api'

const DOC_LABEL: Record<string, string> = {
  '01': 'FACTURA',
  '04': 'NOTA DE CRÉDITO',
  '06': 'GUÍA DE REMISIÓN',
  '07': 'COMPROBANTE DE RETENCIÓN',
}

interface DocumentDetailModalProps {
  document: DocumentStatus | null
  onClose: () => void
}

function Box({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border-warm p-3 ${className}`}>
      {title && (
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">{title}</div>
      )}
      {children}
    </div>
  )
}

function Kv({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col py-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-[11px] font-semibold text-muted">{label}:</span>
      <span className="text-[12px] text-ink">{value ?? '—'}</span>
    </div>
  )
}

const money = (n: number | string | undefined | null) =>
  typeof n === 'number' ? formatPrice(n) : (n ?? '—')

export default function DocumentDetailModal({ document, onClose }: DocumentDetailModalProps) {
  const selectedRuc = useAuthStore((state) => state.selectedRuc)
  const accessKey = document?.access_key ?? null

  const { data: detail, isPending } = useQuery({
    queryKey: ['documents', 'detail', accessKey],
    queryFn: () => getDocumentDetail(accessKey!, selectedRuc!),
    enabled: !!accessKey && !!selectedRuc,
    retry: false,
  })

  if (!document) return null

  const ride = detail?.ride
  const ti = ride?.tributary_info
  const di = ride?.document_info
  const ci = ride?.customer_info
  const rt = ride?.ride_totals
  const items = ride?.items ?? []
  const taxes = ride?.taxes ?? []
  const payments = ride?.payments ?? []
  const additionalInfo = ride?.additional_info ?? []

  const docNumber = `${(ti?.estab ?? document.series)}-${(ti?.ptoEmi ?? document.sequential)}`

  return (
    <Modal
      show
      onClose={onClose}
      size="7xl"
      className="[&>div>div]:border [&>div>div]:border-border-warm [&>div>div]:shadow-none"
    >
      <ModalHeader className="border-border-warm">
        <div className="flex items-center gap-2">
          <Badge tone={document.document_type === '01' ? 'violet' : 'blue'}>
            {DOCUMENT_TYPE_LABELS[document.document_type] ?? document.document_type}
          </Badge>
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${statusBadgeClass(document.status)}`}>
            {DOCUMENT_STATUS_LABELS[document.status] ?? document.status}
          </span>
          <span className="ml-1 font-mono text-[13px] text-muted">
            {document.series}-{document.sequential}
          </span>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        {isPending ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" color="info" />
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {/* Cabecera: emisor + info tributaria */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Box>
                <div className="text-[13px] font-bold text-ink">{ti?.razonSocial ?? '—'}</div>
                {ti?.nombreComercial && <div className="text-[12px] text-muted">{ti.nombreComercial}</div>}
                {ti?.dirMatriz && <div className="text-[11px] text-muted">Dir. Matriz: {ti.dirMatriz}</div>}
              </Box>
              <Box>
                <div className="text-[13px] font-bold text-ink">{DOC_LABEL[document.document_type] ?? 'DETALLE'}</div>
                <Kv label="RUC" value={ti?.ruc ?? '—'} />
                <Kv label="No." value={docNumber} />
                <Kv label="Ambiente" value={(ti?.ambiente ?? '') === '1' ? 'PRUEBAS' : (ti?.ambiente ?? '') === '2' ? 'PRODUCCION' : '—'} />
                <Kv label="Emisión" value={(ti?.tipoEmision ?? '') === '1' ? 'NORMAL' : (ti?.tipoEmision ?? '') === '2' ? 'CONTINGENCIA' : '—'} />
              </Box>
            </div>

            {/* Autorización */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Box title="NÚMERO DE AUTORIZACIÓN">
                <span className="font-mono text-[12px] break-all text-ink">{document.authorization_number ?? '—'}</span>
              </Box>
              <Box title="FECHA Y HORA DE AUTORIZACIÓN">
                <span className="text-[12px] text-ink">{formatDate(document.authorization_date)}</span>
              </Box>
            </div>

            {/* Clave de acceso */}
            <Box>
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted">CLAVE DE ACCESO</div>
              <div className="mt-1 font-mono text-[11px] break-all text-ink">{document.access_key}</div>
            </Box>

            {/* Cliente + datos del documento */}
            {ci && Object.keys(ci).length > 0 && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Box title="CLIENTE">
                  <Kv label="Razón Social" value={ci.razonSocialComprador} />
                  <Kv label="Identificación" value={ci.identificacionComprador} />
                </Box>
                <Box>
                  <Kv label="Dirección" value={ci.direccionComprador ?? '—'} />
                  <Kv label="Fecha de emisión" value={di?.fechaEmision ? formatDate(String(di.fechaEmision)) : '—'} />
                  {di?.placa && <Kv label="Placa" value={di.placa} />}
                </Box>
              </div>
            )}

            {/* Items */}
            <Box>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Detalle</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[12px]">
                  <thead>
                    <tr className="border border-border-warm bg-canvas text-left text-[11px] uppercase text-muted">
                      <th className="border border-border-warm px-2 py-1.5 font-semibold">Cod. Principal</th>
                      <th className="border border-border-warm px-2 py-1.5 text-right font-semibold">Cant.</th>
                      <th className="border border-border-warm px-2 py-1.5 font-semibold">Descripción</th>
                      <th className="border border-border-warm px-2 py-1.5 text-right font-semibold">P. Unitario</th>
                      <th className="border border-border-warm px-2 py-1.5 text-right font-semibold">Descuento</th>
                      <th className="border border-border-warm px-2 py-1.5 text-right font-semibold">P. Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="border border-border-warm px-2 py-4 text-center text-muted">
                          Sin items
                        </td>
                      </tr>
                    ) : (
                      items.map((item, i) => (
                        <tr key={i} className="border border-border-warm align-top last:border-b">
                          <td className="border border-border-warm px-2 py-1.5 font-mono text-muted">
                            {item.codigoPrincipal || item.codigoAuxiliar || '—'}
                          </td>
                          <td className="border border-border-warm px-2 py-1.5 text-right font-mono">
                            {item.cantidad.toFixed(2)}
                          </td>
                          <td className="border border-border-warm px-2 py-1.5 text-ink">
                            {item.descripcion}
                            {item.detalles_adicionales && item.detalles_adicionales.length > 0 && (
                              <div className="mt-0.5 text-[10px] text-muted">
                                {item.detalles_adicionales.map((d, j) => (
                                  <div key={j}>{d.nombre}: {d.valor}</div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="border border-border-warm px-2 py-1.5 text-right font-mono">
                            {item.precioUnitario.toFixed(2)}
                          </td>
                          <td className="border border-border-warm px-2 py-1.5 text-right font-mono">
                            {item.descuento.toFixed(2)}
                          </td>
                          <td className="border border-border-warm px-2 py-1.5 text-right font-mono">
                            {item.precioTotalSinImpuesto.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Box>

            {/* Pagos */}
            {payments.length > 0 && (
              <Box>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Formas de pago</div>
                <table className="w-full border-collapse text-[12px]">
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i}>
                        <td className="border border-border-warm px-2 py-1 text-ink">{p.formaPagoLabel ?? p.formaPago}</td>
                        <td className="border border-border-warm px-2 py-1 text-right font-mono">{formatPrice(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}

            {/* Información adicional + totales */}
            <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
              <Box>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Información adicional</div>
                {additionalInfo.length === 0 ? (
                  <p className="text-[12px] text-muted">Sin información adicional</p>
                ) : (
                  additionalInfo.map((info, i) => (
                    <Kv key={i} label={info.name} value={info.value} />
                  ))
                )}
              </Box>
              <Box>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Totales</div>
                {rt ? (
                  <>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Subtotal IVA</span>
                      <span className="font-mono">{money(rt.subtotal_iva)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Subtotal 0%</span>
                      <span className="font-mono">{money(rt.subtotal_0)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Subtotal No objeto de IVA</span>
                      <span className="font-mono">{money(rt.subtotal_no_objeto)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Subtotal sin impuestos</span>
                      <span className="font-mono">{money(rt.subtotal_sin_impuestos)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Descuento</span>
                      <span className="font-mono">{money(rt.descuento)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">ICE</span>
                      <span className="font-mono">{money(rt.ice)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">IVA</span>
                      <span className="font-mono">{money(rt.iva)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-[12px]">
                      <span className="text-muted">Propina</span>
                      <span className="font-mono">{money(rt.propina)}</span>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-border-warm py-1 text-[13px] font-bold">
                      <span>Valor total</span>
                      <span className="font-mono">{money(rt.valor_total)}</span>
                    </div>
                  </>
                ) : taxes.length > 0 ? (
                  <>
                    {taxes.map((t, i) => (
                      <div key={i} className="flex justify-between py-0.5 text-[12px]">
                        <span className="text-muted">Impuesto ({t.codigo} {t.codigoPorcentaje}%)</span>
                        <span className="font-mono">{formatPrice(t.valor)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-[12px] text-muted">Sin totales disponibles</p>
                )}
              </Box>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="border-border-warm">
        <Button type="button" color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  )
}
