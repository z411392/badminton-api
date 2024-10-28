import { type DocumentSnapshot, FieldPath, type Firestore } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Subscription, fromDocumentSnapshot } from "@/modules/Notifying/dtos/Subscription"

export class SubscriptionDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection() {
        return this.db.collection(Collections.Subscriptions)
    }

    protected async *_inIds(...userIds: string[]) {
        const documentsReference = this.getCollection()
            .where(FieldPath.documentId(), "in", userIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(...allUserIds: string[]) {
        const batchSize = 30
        const mapping: { [userId: string]: Subscription } = {}
        for (let index = 0; index < allUserIds.length; index += 30) {
            const userIds = allUserIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(...userIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const userId of allUserIds) {
            const token = mapping[userId]
            if (!token) continue
            yield token
        }
    }

    async byId(userId: string) {
        let token: Subscription | undefined = undefined
        for await (const found of this.inIds(userId)) {
            token = found
            break
        }
        return token
    }
}
