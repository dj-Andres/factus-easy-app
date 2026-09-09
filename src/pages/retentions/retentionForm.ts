import { parseNum, round2 } from '../../lib/numbers'
import type { IdentificationType, RetentionConfig } from '../../types/api'

export const IDENTIFICATION_TYPES: Record<string, string> = {
  '04': 'RUC',
  '05': 'Cédula',
  '06': 'Pasaporte',
  '07': 'Consumidor Final',
  '08': 'Identificación exterior',
}

export const SUSTENTO_OPTIONS = [
  { value: '01', label: '01 - Factura' },
  { value: '02', label: '02 - Nota de venta' },
  { value: '03', label: '03 - Comprobante de venta' },
  { value: '04', label: '04 - Nota de crédito' },
  { value: '05', label: '05 - Nota de débito' },
  { value: '06', label: '06 - Guía de remisión' },
  { value: '07', label: '07 - Comprobante de retención' },
  { value: '08', label: '08 - Documento complementario' },
]

export interface FormRetentionDetail {
  key: string
  retentionConfigId: number | ''
  codigo: string
  codigoRetencion: string
  descripcion: string
  baseImponible: string
  porcentajeRetener: string
  valorRetenido: string
  codDocSustento: string
  numDocSustento: string
  fechaEmisionDocSustento: string
}

export interface InfoRow {
  clave: string
  valor: string
}

export function emptyDetail(key: string): FormRetentionDetail {
  return {
    key,
    retentionConfigId: '',
    codigo: '1',
    codigoRetencion: '',
    descripcion: '',
    baseImponible: '',
    porcentajeRetener: '',
    valorRetenido: '',
    codDocSustento: '01',
    numDocSustento: '',
    fechaEmisionDocSustento: '',
  }
}

export function round2Str(n: number): string {
  return String(round2(n))
}

export function maxIdLength(tipo: string): number {
  if (tipo === '04') return 13
  if (tipo === '05') return 10
  return 20
}

export function configToDetail(config: RetentionConfig, baseImponible: string, key: string): FormRetentionDetail {
  const base = parseNum(baseImponible)
  const pct = config.percentage
  const created: FormRetentionDetail = {
    key,
    retentionConfigId: config.id,
    codigo: String(config.type),
    codigoRetencion: config.code_sri,
    descripcion: config.name,
    baseImponible,
    porcentajeRetener: String(pct),
    valorRetenido: round2Str((base * pct) / 100),
    codDocSustento: '01',
    numDocSustento: '',
    fechaEmisionDocSustento: '',
  }
  return created
}

export function buildDetailPayload(detail: FormRetentionDetail): {
  retention_config_id?: number
  codigo: string
  codigo_retencion: string
  descripcion: string
  base_imponible: number
  porcentaje_retener: number
  valor_retenido: number
  cod_doc_sustento: string
  num_doc_sustento: string
  fecha_emision_doc_sustento: string
} {
  const payload: {
    retention_config_id?: number
    codigo: string
    codigo_retencion: string
    descripcion: string
    base_imponible: number
    porcentaje_retener: number
    valor_retenido: number
    cod_doc_sustento: string
    num_doc_sustento: string
    fecha_emision_doc_sustento: string
  } = {
    codigo: detail.codigo,
    codigo_retencion: detail.codigoRetencion.trim(),
    descripcion: detail.descripcion.trim(),
    base_imponible: parseNum(detail.baseImponible),
    porcentaje_retener: parseNum(detail.porcentajeRetener),
    valor_retenido: parseNum(detail.valorRetenido),
    cod_doc_sustento: detail.codDocSustento,
    num_doc_sustento: detail.numDocSustento.trim(),
    fecha_emision_doc_sustento: detail.fechaEmisionDocSustento,
  }
  if (detail.retentionConfigId !== '') {
    payload.retention_config_id = Number(detail.retentionConfigId)
  }
  return payload
}

export function sujetoIdentificationType(value: string): IdentificationType {
  return value as IdentificationType
}