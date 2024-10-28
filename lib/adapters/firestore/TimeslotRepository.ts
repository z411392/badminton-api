import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5 } from "uuid"
import { Collections } from "@/constants"
import { type Timeslot, fromDocumentSnapshot } from "@/modules/MeetupManaging/dtos/Timeslot"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class TimeslotRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ meetupId, timestamp }: { meetupId: string; timestamp: number }) {
        return uuid5(String(timestamp), meetupId)
    }
    protected getCollection(groupId: string, meetupId: string) {
        return this.db.collection(Collections.Timeslots.replace(":groupId", groupId).replace(":meetupId", meetupId))
    }
    async get(groupId: string, meetupId: string, timeslotId: string) {
        const collection = this.getCollection(groupId, meetupId)
        const documentSnapshot = await this.transaction.get(collection.doc(timeslotId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(
        timeslot: Timeslot,
        { groupId, meetupId }: { groupId: string; meetupId: string },
    ) {
        const { id: timeslotId, startTime, endTime, fee, courts, capacity, reserved, createdAt, updatedAt } = timeslot
        const now = Date.now()
        const indexName = Indexes.Timeslots
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: timeslotId,
                groupId,
                meetupId,
                fee,
                courts,
                capacity,
                reserved,
                startTime,
                endTime,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(groupId: string, meetupId: string, timeslotId: string, timeslot: Timeslot) {
        const collection = this.getCollection(groupId, meetupId)
        const { id, createdAt, updatedAt, ...documentData } = timeslot
        this.transaction.set(collection.doc(timeslotId), documentData, { merge: true })
        await this.saveToSearchEngine(timeslot, { groupId, meetupId })
    }
    protected async removeFromSearchEngine(timeslotId: string) {
        const indexName = Indexes.Timeslots
        const { taskID } = await this.searchClient.deleteObject({
            indexName,
            objectID: timeslotId,
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(groupId: string, meetupId: string, timeslotId: string) {
        const collection = this.getCollection(groupId, meetupId)
        this.transaction.delete(collection.doc(timeslotId))
        await this.removeFromSearchEngine(timeslotId)
    }
}
