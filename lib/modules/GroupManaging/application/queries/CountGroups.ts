import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"

export type CountingGroups = {}

export class CountGroups extends CallableInstance<[string, CountingGroups], Promise<number>> {
    protected logger: ConsolaInstance
    protected permissionDao: PermissionDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountGroups`)
        this.permissionDao = new PermissionDao({ db })
    }
    async execute(userId: string, {}: CountingGroups) {
        const count = await this.permissionDao.groupsAvailableCount(userId)
        return count
    }
}
