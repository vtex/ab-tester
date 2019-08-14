const MINUTE_TO_MILISEC =  60 * 1000

export const MinutesSinceQuery = (inputDate: string): string => {
    return `now-${Math.floor(TimeDifferenceInMinutes(inputDate))}m`
}

export const TimeDifferenceInMinutes = (inputDate: string): number => {
    const now = new Date()
    const date = new Date(inputDate)
    return (now.getTime() - date.getTime()) / MINUTE_TO_MILISEC
}