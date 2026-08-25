import type { ReactNode } from 'react'

const tones = {
  green: 'bg-emerald-100 text-emerald-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-600',
  violet: 'bg-accent-soft text-accent',
} as const

export type BadgeTone = keyof typeof tones

export default function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
