import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Group = {
    id: string
    name: string
    photoPath: string
    contactUs: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { name, photoPath, contactUs } = documentSnapshot.data() as {
        name: string
        photoPath: string
        contactUs: string
    }
    const group: Group = {
        id: documentSnapshot.id,
        name,
        photoPath,
        contactUs,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return group
}
