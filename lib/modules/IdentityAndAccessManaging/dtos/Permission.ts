import { type PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { type Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"
import { type DocumentSnapshot } from "firebase-admin/firestore"

export type Permission = {
    id: string
    groupId: string
    userId: string
    status: PermissionStatuses
    role: Roles
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { groupId, userId, status, role } = documentSnapshot.data() as {
        groupId: string
        userId: string
        status: PermissionStatuses
        role: Roles
    }
    const permission: Permission = {
        id: documentSnapshot.id,
        groupId,
        userId,
        status,
        role,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return permission
}
