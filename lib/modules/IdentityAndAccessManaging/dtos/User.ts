import { type UserRecord } from "firebase-admin/auth"

export type User = {
    id: string
    displayName?: string
    photoURL?: string
    createdAt: number
    updatedAt?: number
    providers: { [provider: string]: string }
}

export const fromUserRecord = (userRecord: UserRecord) => {
    const providers: { [provider: string]: string } = {}
    for (const { providerId, uid } of userRecord.providerData) providers[providerId] = uid
    const user: User = {
        id: userRecord.uid,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        createdAt: Date.parse(userRecord.metadata.creationTime).valueOf(),
        updatedAt: userRecord.metadata.lastRefreshTime
            ? Date.parse(userRecord.metadata.lastRefreshTime).valueOf()
            : undefined,
        providers,
    }
    return user
}
