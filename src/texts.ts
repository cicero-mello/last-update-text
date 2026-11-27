import type { StatusOptions } from "./types"

export const defaultStatusOptions: StatusOptions = {
    justNow: "just now",
    lessThanAMinuteAgo: "less than a minute ago",
    oneMinuteAgo: "1 minute ago",
    xMinutesAgo: "# minutes ago",
    oneHourAgo: "1 hour ago",
    xHoursAgo: "# hours ago",
    yesterday: "yesterday",
    xDaysAgo: "# days ago",
    oneWeekAgo: "1 week ago",
    xWeeksAgo: "# weeks ago",
    oneMonthAgo: "1 month ago",
    xMonthsAgo: "# months ago",
    moreThanAYearAgo: "more than a year ago"
} as const
