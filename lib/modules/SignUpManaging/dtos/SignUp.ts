import { type DocumentSnapshot } from "firebase-admin/firestore"
import { type SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export type SignUp = {
    id: string
    userId: string
    status: SignUpStatuses
    administratorId?: string
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { userId, status } = documentSnapshot.data() as {
        userId: string
        status: SignUpStatuses
    }
    const signUp: SignUp = {
        id: documentSnapshot.id,
        userId,
        status,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return signUp
}
