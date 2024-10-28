import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Subscription = {
    id: string
    token: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { token } = documentSnapshot.data() as { token: string }
    const subscription: Subscription = {
        id: documentSnapshot.id,
        token,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return subscription
}
