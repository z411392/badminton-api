import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5 } from "uuid"
import { Collections } from "@/constants"
import { type Tag, fromDocumentSnapshot } from "@/modules/TagManaging/dtos/Tag"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class TagRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ groupId, name }: { groupId: string; name: string }) {
        const namespace = uuid5(Collections.Tags, groupId)
        return uuid5(name, namespace)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Tags.replace(":groupId", groupId))
    }
    async get(groupId: string, tagId: string) {
        const collection = this.getCollection(groupId)
        const documentSnapshot = await this.transaction.get(collection.doc(tagId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(tag: Tag, { groupId }: { groupId: string }) {
        const { id, name, createdAt, updatedAt } = tag
        const now = Date.now()
        const indexName = Indexes.Tags
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
    async set(groupId: string, tagId: string, tag: Tag) {
        const collection = this.getCollection(groupId)
        const { id, createdAt, updatedAt, ...documentData } = tag
        this.transaction.set(collection.doc(tagId), documentData, { merge: true })
        await this.saveToSearchEngine(tag, { groupId })
    }
    protected async removeFromSearchEngine(tagId: string) {
        const indexName = Indexes.Tags
        const { taskID } = await this.searchClient.deleteObject({ indexName, objectID: tagId })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(groupId: string, tagId: string) {
        const collection = this.getCollection(groupId)
        this.transaction.delete(collection.doc(tagId))
        await this.removeFromSearchEngine(tagId)
    }
}
