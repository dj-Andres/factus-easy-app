import { parseNum } from '../../lib/numbers'
import type { AdditionalDetail, IdentificationType } from '../../types/api'

export interface FormGuideItem {
  key: string
  productId: number | ''
  cantidad: string
  descripcion: string
  codigoInterno?: string
  codigoAdicional?: string
  detallesAdicionales?: AdditionalDetail[]
}

export const IDENTIFICATION_TYPES: Record<string, string> = {
  '04': 'RUC',
  '05': 'Cédula',
  '06': 'Pasaporte',
  '07': 'Consumidor Final',
  '08': 'Identificación exterior',
}

export interface FormDestinatario {
  key: string
  tipoIdentificacion: string
  identificacion: string
  razonSocial: string
  dirDestinatario: string
  motivoTraslado: string
  docAduaneroUnico: string
  codEstabDestino: string
  ruta: string
  codDocSustento: string
  numDocSustento: string
  numAutDocSustento: string
  fechaEmisionDocSustento: string
  items: FormGuideItem[]
}

export interface InfoRow {
  clave: string
  valor: string
}

export interface FormDestinatarioPayload {
  tipo_identificacion_destinatario: IdentificationType
  identificacion_destinatario: string
  razon_social_destinatario: string
  dir_destinatario: string
  motivo_traslado: string
  doc_aduanero_unico?: string
  cod_estab_destino?: string
  ruta?: string
  cod_doc_sustento?: string
  num_doc_sustento?: string
  num_aut_doc_sustento?: string
  fecha_emision_doc_sustento?: string
  items: Array<{
    product_id: number
    cantidad: number
    descripcion: string
    codigoInterno?: string
    codigoAdicional?: string
    detallesAdicionales?: AdditionalDetail[]
  }>
}

export function buildDestinatarioPayload(destinatario: FormDestinatario, productsById: Map<number, { id: number; description: string }>): FormDestinatarioPayload | null {
  const validItems = destinatario.items.filter((i) => i.productId !== '')
  if (validItems.length === 0) return null

  const payload: FormDestinatarioPayload = {
    tipo_identificacion_destinatario: destinatario.tipoIdentificacion as IdentificationType,
    identificacion_destinatario: destinatario.identificacion.trim(),
    razon_social_destinatario: destinatario.razonSocial.trim(),
    dir_destinatario: destinatario.dirDestinatario.trim(),
    motivo_traslado: destinatario.motivoTraslado.trim(),
    items: [],
  }

  if (destinatario.docAduaneroUnico.trim() !== '') payload.doc_aduanero_unico = destinatario.docAduaneroUnico.trim()
  if (destinatario.codEstabDestino.trim() !== '') payload.cod_estab_destino = destinatario.codEstabDestino.trim()
  if (destinatario.ruta.trim() !== '') payload.ruta = destinatario.ruta.trim()
  if (destinatario.codDocSustento.trim() !== '') payload.cod_doc_sustento = destinatario.codDocSustento.trim()
  if (destinatario.numDocSustento.trim() !== '') payload.num_doc_sustento = destinatario.numDocSustento.trim()
  if (destinatario.numAutDocSustento.trim() !== '') payload.num_aut_doc_sustento = destinatario.numAutDocSustento.trim()
  if (destinatario.fechaEmisionDocSustento.trim() !== '') payload.fecha_emision_doc_sustento = destinatario.fechaEmisionDocSustento.trim()

  for (const item of validItems) {
    const productId = Number(item.productId)
    const product = productsById.get(productId)
    const payloadItem: NonNullable<FormDestinatarioPayload['items']>[number] = {
      product_id: productId,
      cantidad: parseNum(item.cantidad),
      descripcion: item.descripcion.trim() !== ''
        ? item.descripcion.trim()
        : (product?.description ?? ''),
    }
    if (item.codigoInterno?.trim()) payloadItem.codigoInterno = item.codigoInterno.trim()
    if (item.codigoAdicional?.trim()) payloadItem.codigoAdicional = item.codigoAdicional.trim()
    if (item.detallesAdicionales && item.detallesAdicionales.length > 0) {
      payloadItem.detallesAdicionales = item.detallesAdicionales
    }
    payload.items.push(payloadItem)
  }

  return payload
}
