import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { v5 as uuid5 } from "uuid"
import { type Permission, fromDocumentSnapshot } from "@/modules/IdentityAndAccessManaging/dtos/Permission"

export class PermissionRepository {
    protected db: Firestore
    protected transaction: Transaction
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
    }
    static nextId({ groupId, userId }: { groupId: string; userId: string }) {
        return uuid5(userId, groupId)
    }
    protected getCollection() {
        return this.db.collection(Collections.Permissions)
    }
    async get(permissionId: string) {
        const collection = this.getCollection()
        const documentSnapshot = await this.transaction.get(collection.doc(permissionId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    async set(permissionId: string, permission: Permission) {
        const collection = this.getCollection()
        const { id, createdAt, updatedAt, ...documentData } = permission
        this.transaction.set(collection.doc(permissionId), documentData, { merge: true })
    }
}
