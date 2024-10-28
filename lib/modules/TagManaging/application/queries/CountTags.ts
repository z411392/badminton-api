import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { TagDao } from "@/adapters/firestore/TagDao"

export type CountingTags = {
    search: string
}

export class CountTags extends CallableInstance<[string, string, CountingTags], Promise<number>> {
    protected logger: ConsolaInstance
    protected tagDao: TagDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountTags`)
        this.tagDao = new TagDao({ db })
    }
    async execute(userId: string, groupId: string, { search }: CountingTags) {
        const count = await this.tagDao.count({ groupId, search })
        return count
    }
}
