import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { PermissionRepository } from "@/adapters/firestore/PermissionRepository"
import { PermissionDenied } from "@/modules/IdentityAndAccessManaging/errors/PermissionDenied"
import { Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"
import { type PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"

export type ReviewingGroupJoining = {
    permissionId: string
    status: PermissionStatuses
}

export class ReviewGroupJoining extends CallableInstance<[string, string, ReviewingGroupJoining], Promise<string>> {
    protected logger: ConsolaInstance
    protected permissionRepository: PermissionRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`ReviewGroupJoining`)
        this.permissionRepository = new PermissionRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, { permissionId, status }: ReviewingGroupJoining) {
        const permission = await this.permissionRepository.get(permissionId)
        if (!permission) throw new PermissionDenied()
        if (permission.groupId !== groupId) throw new PermissionDenied()
        if (permission.role !== Roles.Member) throw new PermissionDenied()
        permission.status = status
        await this.permissionRepository.set(permissionId, permission)
        return permission.id
    }
}
