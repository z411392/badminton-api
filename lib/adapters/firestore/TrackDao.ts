import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Track, fromDocumentSnapshot } from "@/modules/TrackManaging/dtos/Track"

export class TrackDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection(groupId: string, playlistId: string) {
        return this.db.collection(Collections.Tracks.replace(":groupId", groupId).replace(":playlistId", playlistId))
    }

    protected async *_inIds(groupId: string, playlistId: string, ...trackIds: string[]) {
        const documentsReference = this.getCollection(groupId, playlistId)
            .where(FieldPath.documentId(), "in", trackIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, playlistId: string, ...allTrackIds: string[]) {
        const batchSize = 30
        const mapping: { [trackId: string]: Track } = {}
        for (let index = 0; index < allTrackIds.length; index += 30) {
            const trackIds = allTrackIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, playlistId, ...trackIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const trackId of allTrackIds) {
            const track = mapping[trackId]
            if (!track) continue
            yield track
        }
    }

    async byId(groupId: string, playlistId: string, trackId: string) {
        let track: Track | undefined = undefined
        for await (const found of this.inIds(groupId, playlistId, trackId)) {
            track = found
            break
        }
        return track
    }
}
