import { parseNum } from '../../lib/numbers'
import type { Product, TaxDetail } from '../../types/api'

export interface CreditNoteFormItem {
  key: string
  productId: number | ''
  cantidad: string
  precioUnitario: string
  descuento: string
  taxes: TaxDetail[]
}

export interface CreditNoteItemBreakdown {
  product?: Product
  cantidad: number
  precio: number
  descuento: number
  base: number
  taxes: { codigo: string; name: string; tarifa: number; valor: number }[]
  taxTotal: number
  total: number
}

export function buildCreditNoteBreakdown(
  items: CreditNoteFormItem[],
  productsById: Map<number, Product>,
): CreditNoteItemBreakdown[] {
  return items.map((item) => {
    const product = item.productId ? productsById.get(Number(item.productId)) : undefined
    const cantidad = parseNum(item.cantidad)
    const precio =
      item.precioUnitario.trim() !== '' ? parseNum(item.precioUnitario) : (product?.unit_price ?? 0)
    const descuento = parseNum(item.descuento)
    const base = Math.max(0, cantidad * precio - descuento)

    const taxes = item.taxes.length > 0
      ? item.taxes.map((t) => ({
          codigo: t.codigo,
          name: taxName(t.codigo),
          tarifa: t.tarifa ?? 0,
          valor: Math.round(base * ((t.tarifa ?? 0) / 100) * 100) / 100,
        }))
      : (product?.taxes ?? []).map((t) => ({
          codigo: t.sri_code,
          name: t.name,
          tarifa: t.percentage,
          valor: Math.round(base * (t.percentage / 100) * 100) / 100,
        }))

    const taxTotal = taxes.reduce((sum, t) => sum + t.valor, 0)
    return { product, cantidad, precio, descuento, base, taxes, taxTotal, total: base + taxTotal }
  })
}

export function taxName(codigo: string): string {
  switch (codigo) {
    case '2':
      return 'IVA'
    case '3':
      return 'ICE'
    case '5':
      return 'IRBPNR'
    default:
      return `Impuesto ${codigo}`
  }
}
