import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"
import { PageSizes } from "@/constants"
import { type Permission, fromDocumentSnapshot } from "@/modules/IdentityAndAccessManaging/dtos/Permission"

export class PermissionDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection() {
        return this.db.collection(Collections.Permissions)
    }

    async isWaitingForGroupCreation(userId: string) {
        const collection = this.getCollection()
        const aggregateQuerySnapshot = await collection
            .where("userId", "==", userId)
            .where("status", "==", PermissionStatuses.Pending)
            .where("role", "==", Roles.Owner)
            .count()
            .get()
        const { count } = aggregateQuerySnapshot.data()
        return count > 0
    }

    async groupsAvailableCount(userId: string) {
        const collection = this.getCollection()
        const aggregateQuerySnapshot = await collection
            .where("userId", "==", userId)
            .where("status", "==", PermissionStatuses.Approved)
            .count()
            .get()
        const { count } = aggregateQuerySnapshot.data()
        return count
    }

    async groupsAvailable(userId: string) {
        const page: number = 1
        const limit: number = PageSizes.Unlimited
        const offset = (page - 1) * limit
        const groupIds: string[] = []
        const collection = this.getCollection()
        const stream = collection
            .where("userId", "==", userId)
            .where("status", "==", PermissionStatuses.Approved)
            .offset(offset)
            .select("groupId")
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of stream) {
            const { groupId } = documentSnapshot.data() as { groupId: string }
            groupIds.push(groupId)
        }
        return groupIds
    }

    protected async *_inIds(...permissionIds: string[]) {
        const documentsReference = this.getCollection()
            .where(FieldPath.documentId(), "in", permissionIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(...allPermissionIds: string[]) {
        const batchSize = 30
        const mapping: { [permissionId: string]: Permission } = {}
        for (let index = 0; index < allPermissionIds.length; index += 30) {
            const permissionIds = allPermissionIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(...permissionIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const permissionId of allPermissionIds) {
            const permission = mapping[permissionId]
            if (!permission) continue
            yield permission
        }
    }

    async byId(permissionId: string) {
        let permission: Permission | undefined = undefined
        for await (const found of this.inIds(permissionId)) {
            permission = found
            break
        }
        return permission
    }

    async underGroup(groupId: string) {
        const page: number = 1
        const limit: number = PageSizes.Unlimited
        const mapping: { [userId: string]: Permission } = {}
        const offset = (page - 1) * limit
        const collection = this.getCollection()
        const stream = collection
            .where("groupId", "==", groupId)
            .limit(limit)
            .offset(offset)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of stream) {
            const permission = fromDocumentSnapshot(documentSnapshot)
            mapping[permission.userId] = permission
        }
        return mapping
    }
}
