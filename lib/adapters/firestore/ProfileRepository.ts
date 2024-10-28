import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5 } from "uuid"
import { Collections } from "@/constants"
import { type Profile, fromDocumentSnapshot } from "@/modules/ProfileManaging/dtos/Profile"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class ProfileRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId({ groupId, userId }: { groupId: string; userId: string }) {
        const namespace = uuid5(Collections.Profiles, groupId)
        return uuid5(userId, namespace)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Profiles.replace(":groupId", groupId))
    }
    async get(groupId: string, profileId: string) {
        const collection = this.getCollection(groupId)
        const documentSnapshot = await this.transaction.get(collection.doc(profileId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected async saveToSearchEngine(profile: Profile, { groupId }: { groupId: string }) {
        const { id, userId, levelId, name, line, tagIds, createdAt, updatedAt } = profile
        const now = Date.now()
        const indexName = Indexes.Profiles
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: id,
                groupId,
                userId,
                levelId,
                name,
                line,
                tagIds,
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(groupId: string, profileId: string, profile: Profile) {
        const collection = this.getCollection(groupId)
        const { id, createdAt, updatedAt, ...documentData } = profile
        this.transaction.set(collection.doc(profileId), documentData, { merge: true })
        await this.saveToSearchEngine(profile, { groupId })
    }
}
