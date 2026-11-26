export interface StatusOptions {
    justNow: string
    lessThanAMinuteAgo: string
    oneMinuteAgo: string
    xMinutesAgo: string
    oneHourAgo: string
    xHoursAgo: string
    yesterday: string
    xDaysAgo: string
    oneWeekAgo: string
    xWeeksAgo: string
    oneMonthAgo: string
    xMonthsAgo: string
    moreThanAYearAgo: string
}

export interface LastUpdateTextParams {
    lastUpdate: number
    onStatusChange?: (newStatus: string) => void | Promise<void>
    statusOptions?: Partial<StatusOptions>
    countPlaceholder?: string
}

export interface LastUpdateTextResponse {
    initialStatus: string
    cancelTimers: () => void
}
