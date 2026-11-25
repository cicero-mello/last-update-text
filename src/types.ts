
export interface StatusTexts {
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

export interface UpdatedAtParams {
    lastUpdate: number
    onStatusChange?: (newStatusText: string) => void | Promise<void>
    statusTexts?: Partial<StatusTexts>
    countPlaceholder?: string
}

export interface UpdatedAtResponse {
    initialStatusText: string
    cancelTimers: () => void
}
