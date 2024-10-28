import { type Firestore, type CollectionReference, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuidv1 } from "uuid"
import { Collections } from "@/constants"
import { type Track, fromDocumentSnapshot } from "@/modules/TrackManaging/dtos/Track"

export class TrackRepository {
    protected db: Firestore
    protected transaction: Transaction
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
    }
    static nextId({ playlistId }: { playlistId: string }) {
        return uuid5(uuidv1(), playlistId)
    }
    protected getCollection(groupId: string, playlistId: string): CollectionReference {
        return this.db.collection(Collections.Tracks.replace(":groupId", groupId).replace(":playlistId", playlistId))
    }
    async get(groupId: string, playlistId: string, trackId: string) {
        const collection = this.getCollection(groupId, playlistId)
        const documentSnapshot = await this.transaction.get(collection.doc(trackId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    async set(groupId: string, playlistId: string, trackId: string, track: Track) {
        const collection = this.getCollection(groupId, playlistId)
        const { id, createdAt, updatedAt, ...documentData } = track
        const timestamp = Date.now()
        this.transaction.set(collection.doc(trackId), { ...documentData, timestamp }, { merge: true })
    }
    async remove(groupId: string, playlistId: string, trackId: string) {
        const collection = this.getCollection(groupId, playlistId)
        this.transaction.delete(collection.doc(trackId))
    }
}
