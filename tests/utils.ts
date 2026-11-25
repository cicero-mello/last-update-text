import { TIME_BUFFER } from "../src"
import { jest } from "bun:test"

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const MAX_STEP = 20 * DAY

export const delay = (ms: number) => (
    new Promise((resolve) => setTimeout(resolve, ms))
)

export const createClock = (startTime: number) => {
    const advanceTo = (elapsedMs: number) => {
        const targetTime = startTime + elapsedMs + TIME_BUFFER
        while (Date.now() < targetTime) {
            const remaining = targetTime - Date.now()
            jest.advanceTimersByTime(Math.min(remaining, MAX_STEP))
        }
    }

    return { advanceTo }
}

export const withFakeTimers = (fn: () => void) => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-11-25T12:00:00.000Z"))
    try {
        fn()
    } finally {
        jest.useRealTimers()
    }
}
