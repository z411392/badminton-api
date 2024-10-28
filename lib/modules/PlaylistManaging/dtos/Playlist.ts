import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Playlist = {
    id: string
    name: string
    spotifyId: string
    tracksCount: number
    tracksDuration: number
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { name, spotifyId, tracksCount, tracksDuration } = documentSnapshot.data() as {
        name: string
        spotifyId: string
        tracksCount: number
        tracksDuration: number
    }
    const playlist: Playlist = {
        id: documentSnapshot.id,
        name,
        spotifyId,
        tracksCount,
        tracksDuration,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return playlist
}
