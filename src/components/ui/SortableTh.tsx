import { TableHeadCell } from 'flowbite-react'
import type { ReactNode } from 'react'

interface SortableThProps {
  label: string
  onClick: () => void
  indicator: string
  className?: string
  children?: ReactNode
}

export default function SortableTh({ label, onClick, indicator, className, children }: SortableThProps) {
  return (
    <TableHeadCell onClick={onClick} className={`cursor-pointer select-none ${className ?? ''}`}>
      {label}
      {indicator}
      {children}
    </TableHeadCell>
  )
}
