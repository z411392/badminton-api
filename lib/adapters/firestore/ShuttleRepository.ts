import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Collections } from "@/constants"
import { type Shuttle, fromDocumentSnapshot } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class ShuttleRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId() {
        const namespace = uuid5(Collections.Shuttles, process.env.PROJECT_UUID!)
        return uuid5(uuid1(), namespace)
    }
    protected getCollection() {
        return this.db.collection(Collections.Shuttles)
    }
    async get(shuttleId: string) {
        const collection = this.getCollection()
        const documentSnapshot = await this.transaction.get(collection.doc(shuttleId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(shuttle: Shuttle) {
        const { id, brand, name, createdAt, updatedAt } = shuttle
        const now = Date.now()
        const indexName = Indexes.Shuttles
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: id,
                name: `${brand} ${name}`,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(shuttleId: string, shuttle: Shuttle) {
        const collection = this.getCollection()
        const { id, createdAt, updatedAt, ...documentData } = shuttle
        this.transaction.set(collection.doc(shuttleId), documentData, { merge: true })
        await this.saveToSearchEngine(shuttle)
    }
    protected async removeFromSearchEngine(shuttleId: string) {
        const indexName = Indexes.Shuttles
        const { taskID } = await this.searchClient.deleteObject({ indexName, objectID: shuttleId })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(shuttleId: string) {
        const collection = this.getCollection()
        this.transaction.delete(collection.doc(shuttleId))
        await this.removeFromSearchEngine(shuttleId)
    }
}
