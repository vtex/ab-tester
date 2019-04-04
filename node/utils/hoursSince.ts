const MINUTE_TO_MILISEC =  60 * 1000

export function HoursSince(inputDate: string): string {
    const now = new Date()
    const date = new Date(inputDate)
    const diff = (now.getTime() - date.getTime()) / MINUTE_TO_MILISEC
    console.log(diff)
    return `now-${Math.floor(diff)}m`
}