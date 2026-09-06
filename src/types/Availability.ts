export type DayOfWeek =
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'

export interface Availability {
    id: number
    doctorId: number
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    sessionDuration: number
    enabled: boolean
}