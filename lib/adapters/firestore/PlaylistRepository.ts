import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuidv1 } from "uuid"
import { Collections } from "@/constants"
import { type Playlist, fromDocumentSnapshot } from "@/modules/PlaylistManaging/dtos/Playlist"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class PlaylistRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ groupId }: { groupId: string }) {
        const namespace = uuid5(Collections.Playlists, groupId)
        return uuid5(uuidv1(), namespace)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Playlists.replace(":groupId", groupId))
    }
    async get(groupId: string, playlistId: string) {
        const collection = this.getCollection(groupId)
        const documentSnapshot = await this.transaction.get(collection.doc(playlistId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(playlist: Playlist, { groupId }: { groupId: string }) {
        const { id, name, createdAt, updatedAt } = playlist
        const now = Date.now()
        const indexName = Indexes.Playlists
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: id,
                groupId,
                name,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(groupId: string, playlistId: string, playlist: Playlist) {
        const collection = this.getCollection(groupId)
        const { id, createdAt, updatedAt, ...documentData } = playlist
        this.transaction.set(collection.doc(playlistId), documentData, { merge: true })
        await this.saveToSearchEngine(playlist, { groupId })
    }
    protected async removeFromSearchEngine(playlistId: string) {
        const indexName = Indexes.Playlists
        const { taskID } = await this.searchClient.deleteObject({ indexName, objectID: playlistId })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(groupId: string, playlistId: string) {
        const collection = this.getCollection(groupId)
        this.transaction.delete(collection.doc(playlistId))
        await this.removeFromSearchEngine(playlistId)
    }
}
