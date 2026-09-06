import { apiRequest } from '../api/Api'

import type {
    Note,
    NoteCreateRequest,
} from '../types/Note'

export async function getNotesByVisit(
    visitId: number,
): Promise<Note[]> {
    return apiRequest<Note[]>(
        `/api/notes/visit/${visitId}`,
    )
}

export async function createNote(
    request: NoteCreateRequest,
): Promise<Note> {
    return apiRequest<Note>(
        '/api/notes',
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    )
}