import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { PermissionRepository } from "@/adapters/firestore/PermissionRepository"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { JoinRequestRejected } from "@/modules/GroupManaging/errors/JoinRequestRejected"
import { JoinRequestAlreadySubmitted } from "@/modules/GroupManaging/errors/JoinRequestAlreadySubmitted"
import { HasJoinedGroup } from "@/modules/GroupManaging/errors/HasJoinedGroup"
import { type Permission } from "@/modules/IdentityAndAccessManaging/dtos/Permission"
import { Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"

export class JoinGroup extends CallableInstance<[string, string], Promise<string>> {
    protected logger: ConsolaInstance
    protected permissionRepository: PermissionRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`JoinGroup`)
        this.permissionRepository = new PermissionRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string) {
        const permissionId = PermissionRepository.nextId({ groupId, userId })
        const permissionExists = await this.permissionRepository.get(permissionId)
        if (permissionExists) {
            if (permissionExists.status === PermissionStatuses.Rejected)
                throw new JoinRequestRejected({ userId, groupId })
            else if (permissionExists.status === PermissionStatuses.Pending)
                throw new JoinRequestAlreadySubmitted({ userId, groupId })
            else throw new HasJoinedGroup({ userId, groupId })
        }
        const permission: Permission = {
            userId,
            groupId,
            role: Roles.Member,
            status: PermissionStatuses.Pending,
            id: permissionId,
        }
        await this.permissionRepository.set(permissionId, permission)
        return permissionId
    }
}
