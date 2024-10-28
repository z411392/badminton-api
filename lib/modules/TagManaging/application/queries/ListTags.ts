import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type Tag } from "@/modules/TagManaging/dtos/Tag"
import { TagDao } from "@/adapters/firestore/TagDao"
import { type CountingTags } from "@/modules/TagManaging/application/queries/CountTags"

export type ListingTags = CountingTags & {
    page: number
}

export class ListTags extends CallableInstance<[string, string, ListingTags], AsyncIterable<Tag>> {
    protected logger: ConsolaInstance
    protected tagDao: TagDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListTags`)
        this.tagDao = new TagDao({ db })
    }
    async *execute(userId: string, groupId: string, { page, search }: ListingTags) {
        const tagIds = await this.tagDao.search({ groupId, search }, page)
        if (tagIds.length === 0) return
        for await (const tag of this.tagDao.inIds(groupId, ...tagIds)) yield tag
    }
}
