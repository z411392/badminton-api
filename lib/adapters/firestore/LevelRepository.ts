import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Collections } from "@/constants"
import { type Level, fromDocumentSnapshot } from "@/modules/LevelManaging/dtos/Level"

export class LevelRepository {
    protected db: Firestore
    protected transaction: Transaction
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
    }
    static nextId(groupId: string) {
        const namespace = uuid5(Collections.Levels, groupId)
        return uuid5(uuid1(), namespace)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Levels.replace(":groupId", groupId))
    }
    async get(groupId: string, levelId: string) {
        const collection = this.getCollection(groupId)
        const documentSnapshot = await this.transaction.get(collection.doc(levelId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    async set(groupId: string, levelId: string, level: Level) {
        const collection = this.getCollection(groupId)
        const { id, createdAt, updatedAt, ...documentData } = level
        this.transaction.set(collection.doc(levelId), documentData, { merge: true })
    }
    async remove(groupId: string, levelId: string) {
        const collection = this.getCollection(groupId)
        this.transaction.delete(collection.doc(levelId))
    }
}
