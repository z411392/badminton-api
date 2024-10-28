import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Tag = {
    id: string
    name: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { name } = documentSnapshot.data() as {
        name: string
    }
    const tag: Tag = {
        id: documentSnapshot.id,
        name,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return tag
}
