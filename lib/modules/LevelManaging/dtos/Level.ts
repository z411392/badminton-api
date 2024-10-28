import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Level = {
    id: string
    name: string
    order: number
    color: string
    description: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { name, order, color, description } = documentSnapshot.data() as {
        name: string
        order: number
        color: string
        description: string
    }
    const level: Level = {
        id: documentSnapshot.id,
        name,
        order,
        color,
        description,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return level
}
