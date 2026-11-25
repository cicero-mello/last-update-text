import { createClock, DAY, HOUR, MINUTE, SECOND, withFakeTimers } from "./utils"
import type { StatusTexts } from "../src/types"
import { expect, mock, test } from "bun:test"
import { updatedAt } from "../src"

const customPtBrTexts: StatusTexts = {
    justNow: "agora mesmo",
    lessThanAMinuteAgo: "há menos de um minuto",
    oneMinuteAgo: "há 1 minuto",
    xMinutesAgo: "há # minutos",
    oneHourAgo: "há 1 hora",
    xHoursAgo: "há # horas",
    yesterday: "ontem",
    xDaysAgo: "há # dias",
    oneWeekAgo: "há 1 semana",
    xWeeksAgo: "há # semanas",
    oneMonthAgo: "há 1 mês",
    xMonthsAgo: "há # meses",
    moreThanAYearAgo: "há mais de um ano"
}

test("Must apply all custom statusTexts across every time range", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatusText, cancelTimers } = updatedAt({
        lastUpdate,
        onStatusChange,
        statusTexts: customPtBrTexts
    })

    try {
        // 0: justNow
        expect(initialStatusText).toBe("agora mesmo")

        // 1: lessThanAMinuteAgo
        advanceTo(10 * SECOND)
        expect(onStatusChange).toHaveBeenLastCalledWith("há menos de um minuto")

        // 2: oneMinuteAgo
        advanceTo(1 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 1 minuto")

        // 3: xMinutesAgo
        advanceTo(5 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 5 minutos")

        // 4: oneHourAgo
        advanceTo(1 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 1 hora")

        // 5: xHoursAgo
        advanceTo(3 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 3 horas")

        // 6: yesterday
        advanceTo(1 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("ontem")

        // 7: xDaysAgo
        advanceTo(4 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 4 dias")

        // 8: oneWeekAgo
        advanceTo(7 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 1 semana")

        // 9: xWeeksAgo
        advanceTo(21 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 3 semanas")

        // 10: oneMonthAgo
        advanceTo(30 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 1 mês")

        // 11: xMonthsAgo
        advanceTo(90 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há 3 meses")

        // 12: moreThanAYearAgo
        advanceTo(365 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("há mais de um ano")
    } finally {
        cancelTimers()
    }
}))

test("Must merge partial statusTexts with defaultStatusTexts", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatusText, cancelTimers } = updatedAt({
        lastUpdate,
        onStatusChange,
        statusTexts: {
            justNow: "now!",
            xMinutesAgo: "# mins ago",
            yesterday: "1 day ago"
        }
    })

    try {
        // Overwrite
        expect(initialStatusText).toBe("now!")

        // Standard
        advanceTo(10 * SECOND)
        expect(onStatusChange).toHaveBeenLastCalledWith("less than a minute ago")

        // Standard
        advanceTo(1 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 minute ago")

        // Overwrite
        advanceTo(4 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("4 mins ago")

        // Standard
        advanceTo(1 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 hour ago")

        // Overwrite
        advanceTo(1 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 day ago")

        // Standard
        advanceTo(2 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 days ago")
    } finally {
        cancelTimers()
    }
}))

test("Must replace custom countPlaceholder in all pluralized statusTexts", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { cancelTimers } = updatedAt({
        lastUpdate,
        onStatusChange,
        countPlaceholder: "{count}",
        statusTexts: {
            xMinutesAgo: "{count} mins",
            xHoursAgo: "{count} hrs",
            xDaysAgo: "{count} days",
            xWeeksAgo: "{count} wks",
            xMonthsAgo: "{count} mos"
        }
    })

    try {
        advanceTo(12 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("12 mins")

        advanceTo(6 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("6 hrs")

        advanceTo(3 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("3 days")

        advanceTo(14 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 wks")

        advanceTo(120 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("4 mos")
    } finally {
        cancelTimers()
    }
}))

test("Must keep literal '#' intact when using a custom countPlaceholder", () => withFakeTimers(() => {
    const fiveMinutesAgo = Date.now() - 5 * MINUTE
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatusText, cancelTimers } = updatedAt({
        lastUpdate: fiveMinutesAgo,
        onStatusChange,
        countPlaceholder: "{{n}}",
        statusTexts: {
            xMinutesAgo: "Update #{{n}} minutes ago"
        }
    })

    try {
        expect(initialStatusText).toBe("Update #5 minutes ago")
    } finally {
        cancelTimers()
    }
}))
