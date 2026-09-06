export interface Visit {
    id: number
    doctorId: number
    clientId: number
    visitTime: string
    service: string
}

export interface VisitCreateRequest {
    doctorId: number
    clientId: number
    visitTime: string
    service: string
}