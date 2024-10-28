import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuidv1 } from "uuid"
import { Collections } from "@/constants"
import { type Track, fromDocumentSnapshot } from "@/modules/TrackManaging/dtos/Track"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"
import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 8, interval: 1000, intervalCap: 1000 })
export class TrackRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ playlistId }: { playlistId: string }) {
        return uuid5(uuidv1(), playlistId)
    }
    protected getCollection(groupId: string, playlistId: string) {
        return this.db.collection(Collections.Tracks.replace(":groupId", groupId).replace(":playlistId", playlistId))
    }
    async get(groupId: string, playlistId: string, trackId: string) {
        const collection = this.getCollection(groupId, playlistId)
        const documentSnapshot = await this.transaction.get(collection.doc(trackId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(track: Track, { groupId, playlistId }: { groupId: string; playlistId: string }) {
        const { id, userId, spotifyId, createdAt, updatedAt } = track
        const now = Date.now()
        const indexName = Indexes.Tracks
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: id,
                groupId,
                userId,
                spotifyId,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        queue.add(() => this.searchClient.waitForTask({ indexName, taskID }))
    }
    async set(groupId: string, playlistId: string, trackId: string, track: Track) {
        const collection = this.getCollection(groupId, playlistId)
        const { id, createdAt, updatedAt, ...documentData } = track
        const timestamp = Date.now()
        this.transaction.set(collection.doc(trackId), { ...documentData, timestamp }, { merge: true })
        await this.saveToSearchEngine(track, { groupId, playlistId })
    }
    protected async removeFromSearchEngine(trackId: string) {
        const indexName = Indexes.Tracks
        const { taskID } = await this.searchClient.deleteObject({ indexName, objectID: trackId })
        queue.add(() => this.searchClient.waitForTask({ indexName, taskID }))
    }
    async remove(groupId: string, playlistId: string, trackId: string) {
        const collection = this.getCollection(groupId, playlistId)
        this.transaction.delete(collection.doc(trackId))
        await this.removeFromSearchEngine(trackId)
    }
}
