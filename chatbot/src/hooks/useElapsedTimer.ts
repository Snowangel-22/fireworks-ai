import { useState, useRef, useCallback } from 'react'

export function useElapsedTimer() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    setElapsedMs(0)
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current)
    }, 100)
  }, [])

  const stop = useCallback((): number => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const elapsed = Date.now() - startTimeRef.current
    setElapsedMs(elapsed)
    return elapsed
  }, [])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setElapsedMs(0)
  }, [])

  return { elapsedMs, start, stop, reset }
}
