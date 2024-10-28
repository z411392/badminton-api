import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Collections } from "@/constants"
import { type Meetup, fromDocumentSnapshot } from "@/modules/MeetupManaging/dtos/Meetup"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class MeetupRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId(groupId: string) {
        const namespace = uuid5(Collections.Meetups, groupId)
        return uuid5(uuid1(), namespace)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Meetups.replace(":groupId", groupId))
    }
    async get(groupId: string, meetupId: string) {
        const collection = this.getCollection(groupId)
        const documentSnapshot = await this.transaction.get(collection.doc(meetupId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(meetup: Meetup, { groupId }: { groupId: string }) {
        const { id: meetupId, name, date, description, venueId, shuttleIds, playlistId, createdAt, updatedAt } = meetup
        const now = Date.now()
        const indexName = Indexes.Meetups
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: meetupId,
                groupId,
                meetupId,
                name,
                date,
                description,
                venueId,
                shuttleIds,
                playlistId,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(groupId: string, meetupId: string, meetup: Meetup) {
        const collection = this.getCollection(groupId)
        const { id, createdAt, updatedAt, ...documentData } = meetup
        this.transaction.set(collection.doc(meetupId), documentData, { merge: true })
        await this.saveToSearchEngine(meetup, { groupId })
    }
    protected async removeFromSearchEngine(meetupId: string) {
        const indexName = Indexes.Meetups
        const { taskID } = await this.searchClient.deleteObject({
            indexName,
            objectID: meetupId,
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(groupId: string, meetupId: string) {
        const collection = this.getCollection(groupId)
        this.transaction.delete(collection.doc(meetupId))
        await this.removeFromSearchEngine(meetupId)
    }
}
