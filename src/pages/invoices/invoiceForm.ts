import { parseNum, round2 } from '../../lib/numbers'
import type { Product } from '../../types/api'

export interface FormItem {
  key: string
  productId: number | ''
  cantidad: string
  precioUnitario: string
  descuento: string
}

export interface FormPayment {
  key: string
  formaPago: string
  total: string
}

export interface InfoRow {
  clave: string
  valor: string
}

export interface ItemTax {
  name: string
  percentage: number
  valor: number
}

export interface ItemBreakdown {
  product?: Product
  cantidad: number
  precio: number
  descuento: number
  base: number
  taxes: ItemTax[]
  taxTotal: number
  total: number
}

export interface TaxGroup {
  name: string
  base: number
  valor: number
}

export function buildBreakdown(items: FormItem[], productsById: Map<number, Product>): ItemBreakdown[] {
  return items.map((item) => {
    const product = item.productId ? productsById.get(Number(item.productId)) : undefined
    const cantidad = parseNum(item.cantidad)
    const precio =
      item.precioUnitario.trim() !== '' ? parseNum(item.precioUnitario) : (product?.unit_price ?? 0)
    const descuento = parseNum(item.descuento)
    const base = Math.max(0, cantidad * precio - descuento)
    const taxes = (product?.taxes ?? []).map((t) => ({
      name: t.name,
      percentage: t.percentage,
      valor: base * (t.percentage / 100),
    }))
    const taxTotal = taxes.reduce((sum, t) => sum + t.valor, 0)
    return { product, cantidad, precio, descuento, base, taxes, taxTotal, total: base + taxTotal }
  })
}

export function groupTaxes(breakdown: ItemBreakdown[]): TaxGroup[] {
  const map = new Map<string, TaxGroup>()
  for (const b of breakdown) {
    for (const t of b.taxes) {
      const g = map.get(t.name) ?? { name: t.name, base: 0, valor: 0 }
      g.base += b.base
      g.valor += t.valor
      map.set(t.name, g)
    }
  }
  return [...map.values()]
}

export function lastPaymentAuto(payments: FormPayment[], total: number): number {
  const allButLast = payments.slice(0, -1).reduce((s, p) => s + parseNum(p.total), 0)
  return round2(total - allButLast)
}

export function resolvePayments(
  payments: FormPayment[],
  total: number,
): { formaPago: string; total: number }[] {
  const valid = payments.filter((p) => p.formaPago !== '')
  return valid.map((p, i) => {
    const isLast = i === valid.length - 1
    const value = isLast
      ? round2(total - valid.slice(0, i).reduce((s, x) => s + parseNum(x.total), 0))
      : round2(parseNum(p.total))
    return { formaPago: p.formaPago, total: value }
  })
}
