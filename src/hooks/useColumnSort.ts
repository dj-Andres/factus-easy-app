import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: string
  dir: SortDirection
}

export function useColumnSort<T>(
  rows: T[],
  getValue: (row: T, key: string) => string | number | null | undefined,
) {
  const [sort, setSort] = useState<SortState | null>(null)

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    return [...rows].sort((a, b) => {
      const av = getValue(a, sort.key)
      const bv = getValue(b, sort.key)
      const an = typeof av === 'number' ? av : Number(av)
      const bn = typeof bv === 'number' ? bv : Number(bv)
      const avNumeric = typeof av === 'number' || (!Number.isNaN(an) && av !== '' && av !== null && av !== undefined)
      const bvNumeric = typeof bv === 'number' || (!Number.isNaN(bn) && bv !== '' && bv !== null && bv !== undefined)

      let cmp: number
      if (avNumeric && bvNumeric) {
        cmp = Number(av) - Number(bv)
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'es', { numeric: true })
      }

      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort, getValue])

  const toggle = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  const reset = () => setSort(null)

  return {
    sort,
    sortedRows,
    toggle,
    reset,
    indicator: (key: string) => (sort?.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''),
  }
}
