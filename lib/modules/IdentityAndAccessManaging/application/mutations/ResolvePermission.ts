import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { PermissionRepository } from "@/adapters/firestore/PermissionRepository"
import { type Permission } from "@/modules/IdentityAndAccessManaging/dtos/Permission"

export class ResolvePermission extends CallableInstance<[string, string], Promise<Permission | undefined>> {
    protected logger: ConsolaInstance
    protected permissionDao: PermissionDao
    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolvePermission`)
        this.permissionDao = new PermissionDao({ db })
    }
    async execute(userId: string, groupId: string) {
        const permissionId = PermissionRepository.nextId({ groupId, userId })
        const permission = await this.permissionDao.byId(permissionId)
        return permission
    }
}
