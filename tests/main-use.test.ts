import { createClock, DAY, delay, HOUR, MINUTE, SECOND, withFakeTimers } from "./utils"
import { TIME_BUFFER, lastUpdateText } from "../src"
import { expect, mock, test } from "bun:test"

test("Must show 2 first messages correctly in real time", async () => {
    const timeNow = Date.now()
    let updatedStatus: string | undefined = ""

    const { initialStatus, cancelTimers } = lastUpdateText({
        lastUpdate: timeNow,
        onStatusChange: (newStatus) => {
            updatedStatus = newStatus
        }
    })

    try {
        expect(initialStatus).toBe("just now")
        expect(updatedStatus).toBe("just now")

        await delay(5 * SECOND)
        expect(updatedStatus).toEqual("just now")

        await delay(5 * SECOND + TIME_BUFFER)
        expect(updatedStatus).toEqual("less than a minute ago")
    } finally {
        cancelTimers()
    }
}, 15_000)

test("Must progress through seconds, minutes, and hours in sequence", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatus, cancelTimers } = lastUpdateText({
        lastUpdate,
        onStatusChange
    })

    try {
        expect(initialStatus).toBe("just now")
        expect(onStatusChange).toHaveBeenLastCalledWith("just now")

        advanceTo(10 * SECOND)
        expect(onStatusChange).toHaveBeenLastCalledWith("less than a minute ago")

        advanceTo(60 * SECOND)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 minute ago")

        advanceTo(2 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 minutes ago")

        advanceTo(5 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("5 minutes ago")

        advanceTo(59 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("59 minutes ago")

        advanceTo(60 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 hour ago")

        advanceTo(2 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 hours ago")

        advanceTo(3 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("3 hours ago")

        advanceTo(5 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("5 hours ago")

        advanceTo(23 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("23 hours ago")

        advanceTo(23 * HOUR + 59 * MINUTE)
        expect(onStatusChange).toHaveBeenLastCalledWith("23 hours ago")

        advanceTo(24 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("yesterday")
    } finally {
        cancelTimers()
    }
}))

test("Must progress through days, weeks, months and more than a year", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatus, cancelTimers } = lastUpdateText({
        lastUpdate,
        onStatusChange
    })

    try {
        expect(initialStatus).toBe("just now")

        advanceTo(1 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("yesterday")

        advanceTo(1 * DAY + 12 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("yesterday")

        advanceTo(1 * DAY + 23 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("yesterday")

        advanceTo(2 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 days ago")

        advanceTo(5 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("5 days ago")

        advanceTo(6 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("6 days ago")

        advanceTo(6 * DAY + 23 * HOUR)
        expect(onStatusChange).toHaveBeenLastCalledWith("6 days ago")

        advanceTo(7 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 week ago")

        advanceTo(13 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 week ago")

        advanceTo(14 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 weeks ago")

        advanceTo(20 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 weeks ago")

        advanceTo(21 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("3 weeks ago")

        advanceTo(27 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("3 weeks ago")

        advanceTo(28 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("4 weeks ago")

        advanceTo(30 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 month ago")

        advanceTo(33 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 month ago")

        advanceTo(59 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 month ago")

        advanceTo(60 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("2 months ago")

        advanceTo(90 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("3 months ago")

        advanceTo(140 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("4 months ago")

        advanceTo(360 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("12 months ago")

        advanceTo(364 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("12 months ago")

        advanceTo(365 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("more than a year ago")

        const callsBeforeFinal = onStatusChange.mock.calls.length

        advanceTo(395 * DAY)
        expect(onStatusChange).toHaveBeenCalledTimes(callsBeforeFinal)
    } finally {
        cancelTimers()
    }
}))

test("Must correctly calculate the initial state when lastUpdate is in the past", () => withFakeTimers(() => {
    const thirtyFiveMinutesAgo = Date.now() - 35 * MINUTE
    const { advanceTo } = createClock(thirtyFiveMinutesAgo)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatus, cancelTimers } = lastUpdateText({
        lastUpdate: thirtyFiveMinutesAgo,
        onStatusChange
    })

    try {
        expect(initialStatus).toBe("35 minutes ago")

        advanceTo(36 * MINUTE)
        expect(onStatusChange).toHaveBeenCalledTimes(2)
        expect(onStatusChange).toHaveBeenCalledWith("36 minutes ago")
    } finally {
        cancelTimers()
    }
}))

test("Must handle the transition from 28 days (4 weeks) to 30 days (1 month) without any delay", () => withFakeTimers(() => {
    const twentyEightDaysAgo = Date.now() - 28 * DAY
    const { advanceTo } = createClock(twentyEightDaysAgo)
    const onStatusChange = mock((_text?: string) => { })

    const { initialStatus, cancelTimers } = lastUpdateText({
        lastUpdate: twentyEightDaysAgo,
        onStatusChange
    })

    try {
        expect(initialStatus).toBe("4 weeks ago")
        expect(onStatusChange).toHaveBeenLastCalledWith("4 weeks ago")

        advanceTo(29 * DAY)
        expect(onStatusChange).toHaveBeenLastCalledWith("4 weeks ago")

        advanceTo(30 * DAY)
        expect(onStatusChange).toHaveBeenCalledTimes(2)
        expect(onStatusChange).toHaveBeenLastCalledWith("1 month ago")
    } finally {
        cancelTimers()
    }
}))

test("Must stop future updates when calling cancelTimers", () => withFakeTimers(() => {
    const lastUpdate = Date.now()
    const { advanceTo } = createClock(lastUpdate)
    const onStatusChange = mock((_text?: string) => { })

    const { cancelTimers } = lastUpdateText({
        lastUpdate,
        onStatusChange
    })

    cancelTimers()
    advanceTo(5 * MINUTE)

    expect(onStatusChange).toHaveBeenLastCalledWith("just now")
}))
