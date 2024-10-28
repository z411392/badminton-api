import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Track = {
    id: string
    userId: string
    spotifyId: string
    snapshotId: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { userId, spotifyId, snapshotId } = documentSnapshot.data() as {
        userId: string
        spotifyId: string
        snapshotId: string
    }
    const track: Track = {
        id: documentSnapshot.id,
        userId,
        spotifyId,
        snapshotId,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return track
}
