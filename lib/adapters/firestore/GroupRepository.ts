import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Collections } from "@/constants"
import { type Group, fromDocumentSnapshot } from "@/modules/GroupManaging/dtos/Group"

export class GroupRepository {
    protected db: Firestore
    protected transaction: Transaction
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
    }
    static nextId() {
        const namespace = uuid5(Collections.Groups, process.env.PROJECT_UUID!)
        return uuid5(uuid1(), namespace)
    }
    protected getCollection() {
        return this.db.collection(Collections.Groups)
    }
    async get(groupId: string) {
        const collection = this.getCollection()
        const documentSnapshot = await this.transaction.get(collection.doc(groupId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    async set(groupId: string, group: Group) {
        const collection = this.getCollection()
        const { id, createdAt, updatedAt, ...documentData } = group
        this.transaction.set(collection.doc(groupId), documentData, { merge: true })
    }
}
