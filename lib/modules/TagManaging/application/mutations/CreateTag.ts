import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { TagRepository } from "@/adapters/firestore/TagRepository"
import { type Tag } from "@/modules/TagManaging/dtos/Tag"
import { TagConflict } from "@/modules/TagManaging/errors/TagConflict"

export type CreatingTag = {
    name: string
}
export class CreateTag extends CallableInstance<[string, string, CreatingTag], Promise<{ tagId: string }>> {
    protected logger: ConsolaInstance
    protected tagRepository: TagRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateTag`)
        this.tagRepository = new TagRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, { name }: CreatingTag) {
        const tagId = TagRepository.nextId({ groupId, name })
        const tagExists = await this.tagRepository.get(groupId, tagId)
        if (tagExists) throw new TagConflict({ groupId, name })
        const tag: Tag = {
            id: tagId,
            name,
        }
        await this.tagRepository.set(groupId, tagId, tag)
        return tagId
    }
}
