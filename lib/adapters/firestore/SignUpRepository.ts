import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5 } from "uuid"
import { Collections } from "@/constants"
import { type SignUp, fromDocumentSnapshot } from "@/modules/SignUpManaging/dtos/SignUp"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class SignUpRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ timeslotId, userId }: { timeslotId: string; userId: string }) {
        return uuid5(userId, timeslotId)
    }
    protected getCollection(groupId: string, meetupId: string, timeslotId: string) {
        return this.db.collection(
            Collections.SignUps.replace(":groupId", groupId)
                .replace(":meetupId", meetupId)
                .replace(":timeslotId", timeslotId),
        )
    }
    async get(groupId: string, meetupId: string, timeslotId: string, signUpId: string) {
        const collection = this.getCollection(groupId, meetupId, timeslotId)
        const documentSnapshot = await this.transaction.get(collection.doc(signUpId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(
        signUp: SignUp,
        { groupId, meetupId, timeslotId }: { groupId: string; meetupId: string; timeslotId: string },
    ) {
        const { id: signUpId, userId, status, createdAt, updatedAt } = signUp
        const now = Date.now()
        const indexName = Indexes.SignUps
        await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: signUpId,
                groupId,
                meetupId,
                timeslotId,
                userId,
                status,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        // await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(
        groupId: string,
        meetupId: string,
        timeslotId: string,
        signUpId: string,
        signUp: SignUp,
        timestamp?: number,
    ) {
        const collection = this.getCollection(groupId, meetupId, timeslotId)
        const { id, createdAt, updatedAt, ...documentData } = signUp
        if (!timestamp) timestamp = Date.now()
        this.transaction.set(collection.doc(signUpId), { ...documentData, timestamp }, { merge: true })
        await this.saveToSearchEngine(signUp, { groupId, meetupId, timeslotId })
    }
}
