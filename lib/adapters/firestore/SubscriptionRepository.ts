import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Subscription } from "@/modules/Notifying/dtos/Subscription"

export class SubscriptionRepository {
    protected db: Firestore
    protected transaction: Transaction
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
    }
    protected getCollection() {
        return this.db.collection(Collections.Subscriptions)
    }
    async set(userId: string, subscription: Subscription) {
        const collection = this.getCollection()
        const { id, createdAt, updatedAt, ...documentData } = subscription
        this.transaction.set(collection.doc(userId), documentData, { merge: true })
    }
}
