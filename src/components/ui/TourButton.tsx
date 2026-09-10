import { useTour } from '../../hooks/useTour'

interface TourButtonProps {
  tourName: string
}

export default function TourButton({ tourName }: TourButtonProps) {
  const { start, reset } = useTour(tourName)

  const handleClick = () => {
    reset()
    start()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-warm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
      title="Recorrer tutorial"
      aria-label="Recorrer tutorial"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 015.83 1c0 2-3 2.4-3 4" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    </button>
  )
}
