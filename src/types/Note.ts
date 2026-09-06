export interface Note {
    id: number
    visitId: number
    content: string
    createdAt: string
    updatedAt: string
}

export interface NoteCreateRequest {
    visitId: number
    content: string
}