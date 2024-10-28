import { type DocumentSnapshot } from "firebase-admin/firestore"
import { type Timeslot } from "@/modules/MeetupManaging/dtos/Timeslot"

export type Meetup = {
    id: string
    name: string
    date: string
    venueId: string
    shuttleIds: string[]
    playlistId?: string
    description: string
    createdAt?: number
    updatedAt?: number
}

export type MeetupWithTimeslots = Meetup & {
    timeslots: Timeslot[]
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { name, date, venueId, shuttleIds, description, playlistId } = documentSnapshot.data() as {
        name: string
        date: string
        venueId: string
        shuttleIds: string[]
        playlistId?: string
        description: string
    }
    const meetup: Meetup = {
        id: documentSnapshot.id,
        name,
        date,
        venueId,
        shuttleIds,
        description,
        playlistId,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return meetup
}
