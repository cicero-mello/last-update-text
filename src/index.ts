import type { StatusOptions, LastUpdateTextParams, LastUpdateTextResponse } from "./types"
import { defaultStatusOptions } from "./texts"

const MAX_TIMEOUT_MS = 2_147_483_647// ~24.8 days (integer 32-bit timer limit)
export const TIME_BUFFER = 100

const secondToMs = (second: number) => second * 1000
const minuteToMs = (minute: number) => minute * 1000 * 60
const hourToMs = (hour: number) => hour * 1000 * 60 * 60
const dayToMs = (day: number) => day * 1000 * 60 * 60 * 24
const monthToMs = (month: number) => month * 1000 * 60 * 60 * 24 * 30

export type { StatusOptions, LastUpdateTextParams, LastUpdateTextResponse }

/**
 * Turns a timestamp into live-updating time-ago text, with customizable phrasing.
 *
 * @param since - Unix timestamp in milliseconds of when the event occurred.
 * @param onStatusChange - Callback invoked immediately with the initial status and whenever the text changes over time.
 * @param statusOptions - Custom labels or translations used to override the default status messages.
 * @param countPlaceholder - Character or string replaced by the time number in plural templates. Defaults to `"#"`.
 * @param autoUpdate - Automatically updates the text over time via `onStatusChange`. Set to `false` to calculate only `initialStatus` without scheduling timers. Defaults to `true`.
 * @returns An object containing the `initialStatus` string and a `stop` cleanup function to cancel future updates.
 */
export const lastUpdateText = ({
    since,
    onStatusChange,
    statusOptions,
    countPlaceholder = "#",
    autoUpdate = true
}: LastUpdateTextParams): LastUpdateTextResponse => {
    const texts: StatusOptions = {
        ...defaultStatusOptions,
        ...statusOptions
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let isCancelled = false

    const clearPendingTimeout = () => {
        clearTimeout(timeoutId)
        timeoutId = undefined
    }

    const stop = () => {
        isCancelled = true
        clearPendingTimeout()
    }

    const scheduleNextCheck = (delayMs: number) => {
        if (!autoUpdate) return

        clearPendingTimeout()
        if (isCancelled || !onStatusChange) return

        const safeDelay = Math.max(0, Math.min(delayMs + TIME_BUFFER, MAX_TIMEOUT_MS))

        timeoutId = setTimeout(() => {
            if (isCancelled) return
            const newStatusText = calculateStatusText(Date.now())
            onStatusChange(newStatusText)
        }, safeDelay)
    }

    const formatCount = (template: string, value: number) => (
        template.replace(countPlaceholder, String(value))
    )

    const calculateStatusText = (currentTime: number): string => {
        const deltaMilliseconds = Math.max(0, currentTime - since)
        const deltaSeconds = Math.floor(deltaMilliseconds / 1000)

        if (deltaSeconds < 10) {
            const firstTenSeconds = secondToMs(10) - deltaMilliseconds
            scheduleNextCheck(firstTenSeconds)
            return texts.justNow
        }

        if (deltaSeconds < 60) {
            const firstMinute = secondToMs(60) - deltaMilliseconds
            scheduleNextCheck(firstMinute)
            return texts.lessThanAMinuteAgo
        }

        const deltaMinutes = Math.floor(deltaSeconds / 60)

        if (deltaMinutes === 1) {
            const secondMinute = minuteToMs(2) - deltaMilliseconds
            scheduleNextCheck(secondMinute)
            return texts.oneMinuteAgo
        }

        if (deltaMinutes < 60) {
            const nextMinute = minuteToMs(deltaMinutes + 1) - deltaMilliseconds
            scheduleNextCheck(nextMinute)
            return formatCount(texts.xMinutesAgo, deltaMinutes)
        }

        const deltaHours = Math.floor(deltaMinutes / 60)

        if (deltaHours === 1) {
            const secondHour = hourToMs(2) - deltaMilliseconds
            scheduleNextCheck(secondHour)
            return texts.oneHourAgo
        }

        if (deltaHours < 24) {
            const nextHour = hourToMs(deltaHours + 1) - deltaMilliseconds
            scheduleNextCheck(nextHour)
            return formatCount(texts.xHoursAgo, deltaHours)
        }

        const deltaDays = Math.floor(deltaHours / 24)

        if (deltaDays === 1) {
            const secondDay = dayToMs(2) - deltaMilliseconds
            scheduleNextCheck(secondDay)
            return texts.yesterday
        }

        if (deltaDays < 7) {
            const nextDay = dayToMs(deltaDays + 1) - deltaMilliseconds
            scheduleNextCheck(nextDay)
            return formatCount(texts.xDaysAgo, deltaDays)
        }

        const deltaWeeks = Math.floor(deltaDays / 7)

        if (deltaWeeks === 1) {
            const secondWeek = dayToMs(14) - deltaMilliseconds
            scheduleNextCheck(secondWeek)
            return texts.oneWeekAgo
        }

        if (deltaDays < 30) {
            const nextWeekDay = (deltaWeeks + 1) * 7
            const limitDay = Math.min(nextWeekDay, 30)
            const msUntilLimit = dayToMs(limitDay) - deltaMilliseconds
            scheduleNextCheck(msUntilLimit)
            return formatCount(texts.xWeeksAgo, deltaWeeks)
        }

        const YEAR_DAYS = 365
        const deltaMonths = Math.floor(deltaDays / 30)

        if (deltaMonths === 1) {
            const secondMonth = monthToMs(2) - deltaMilliseconds
            scheduleNextCheck(secondMonth)
            return texts.oneMonthAgo
        }

        if (deltaDays < YEAR_DAYS) {
            const nextMonth = monthToMs(deltaMonths + 1)
            const yearLimit = dayToMs(YEAR_DAYS)
            const msUntilLimit = Math.min(nextMonth, yearLimit) - deltaMilliseconds
            scheduleNextCheck(msUntilLimit)
            return formatCount(texts.xMonthsAgo, deltaMonths)
        }

        clearPendingTimeout()
        return texts.moreThanAYearAgo
    }

    const initialStatus = calculateStatusText(Date.now())
    if (onStatusChange && autoUpdate) onStatusChange(initialStatus)

    return {
        initialStatus,
        stop
    }
}
