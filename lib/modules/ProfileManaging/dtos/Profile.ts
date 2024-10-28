import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Profile = {
    id: string
    userId: string
    groupId: string
    levelId: string
    name: string
    line: string
    tagIds: string[]
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { userId, groupId, levelId, name, line, tagIds } = documentSnapshot.data() as {
        userId: string
        groupId: string
        levelId: string
        name: string
        line: string
        tagIds: string[]
    }
    const profile: Profile = {
        id: documentSnapshot.id,
        userId,
        groupId,
        levelId,
        name,
        line,
        tagIds,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return profile
}
