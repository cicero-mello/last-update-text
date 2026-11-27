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

interface LastUpdateTextBaseParams {
    since: number
    statusOptions?: Partial<StatusOptions>
    countPlaceholder?: string
}

interface LastUpdateTextWithAutoUpdate extends LastUpdateTextBaseParams {
    autoUpdate?: true
    onStatusChange?: (newStatus: string) => void | Promise<void>
}

interface LastUpdateTextWithoutAutoUpdate extends LastUpdateTextBaseParams {
    autoUpdate: false
    onStatusChange?: never
}

export type LastUpdateTextParams = (
    LastUpdateTextWithAutoUpdate |
    LastUpdateTextWithoutAutoUpdate
)

export interface LastUpdateTextResponse {
    initialStatus: string
    stop: () => void
}
