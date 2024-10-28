import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { GroupDao } from "@/adapters/firestore/GroupDao"
import { type Group } from "@/modules/GroupManaging/dtos/Group"

export class ResolveGroup extends CallableInstance<[string, string], Promise<Group | undefined>> {
    protected logger: ConsolaInstance
    protected groupDao: GroupDao
    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolveGroup`)
        this.groupDao = new GroupDao({ db })
    }
    async execute(userId: string, groupId: string) {
        const group = await this.groupDao.byId(groupId)
        if (!group) return undefined
        return group
    }
}
