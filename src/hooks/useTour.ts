import { useCallback } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useAuthStore } from '../stores/authStore'
import { driverConfig, markTourCompleted, resetTourFlag, TOUR_STEPS } from '../config/tours'

let activeDriver: ReturnType<typeof driver> | null = null
let suppressCompletion = false

export function startTourByName(tourName: string, userId: number): void {
  const steps = TOUR_STEPS[tourName]
  if (!steps || steps.length === 0) return

  if (activeDriver) {
    suppressCompletion = true
    activeDriver.destroy()
    suppressCompletion = false
  }

  const driverObj = driver({
    ...driverConfig,
    steps,
    onDestroyed: () => {
      if (!suppressCompletion) markTourCompleted(tourName, userId)
    },
  })

  activeDriver = driverObj
  driverObj.drive()
}

export function useTour(tourName: string) {
  const userId = useAuthStore((state) => state.user?.id)

  const start = useCallback(() => {
    if (!userId) return
    startTourByName(tourName, userId)
  }, [tourName, userId])

  const reset = useCallback(() => {
    if (!userId) return
    resetTourFlag(tourName, userId)
  }, [tourName, userId])

  return { start, reset }
}
