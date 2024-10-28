import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"
import { type Group } from "@/modules/GroupManaging/dtos/Group"
import { GroupDao } from "@/adapters/firestore/GroupDao"
import { type CountingGroups } from "@/modules/GroupManaging/application/queries/CountGroups"

export type ListingGroups = CountingGroups & {
    page: number
}

export class ListGroups extends CallableInstance<[string, ListingGroups], AsyncIterable<Group>> {
    protected logger: ConsolaInstance
    protected permissionDao: PermissionDao
    protected groupDao: GroupDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListGroups`)
        this.permissionDao = new PermissionDao({ db })
        this.groupDao = new GroupDao({ db })
    }
    async *execute(userId: string, {}: ListingGroups) {
        const groupIds = await this.permissionDao.groupsAvailable(userId)
        if (!groupIds.length) return
        for await (const group of this.groupDao.inIds(...groupIds)) yield group
    }
}
