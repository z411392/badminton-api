import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Shuttle = {
    id: string
    brand: string
    name: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { brand, name } = documentSnapshot.data() as {
        brand: string
        name: string
    }
    const shuttle: Shuttle = {
        id: documentSnapshot.id,
        brand,
        name,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return shuttle
}
