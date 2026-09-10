import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { isTourCompleted } from '../config/tours'
import { useTour } from './useTour'

export function usePageTour(tourName: string) {
  const userId = useAuthStore((state) => state.user?.id)
  const { start, reset } = useTour(tourName)

  useEffect(() => {
    if (!userId) return
    if (isTourCompleted(tourName, userId)) return

    const timeout = setTimeout(start, 600)
    return () => clearTimeout(timeout)
  }, [tourName, userId, start])

  return { start, reset }
}
