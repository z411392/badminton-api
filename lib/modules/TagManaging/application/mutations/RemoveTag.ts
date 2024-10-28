import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { TagRepository } from "@/adapters/firestore/TagRepository"
import { TagNotFound } from "@/modules/TagManaging/errors/TagNotFound"

export class RemoveTag extends CallableInstance<[string, string, string], Promise<{ tagId: string }>> {
    protected logger: ConsolaInstance
    protected tagRepository: TagRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveTag`)
        this.tagRepository = new TagRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, tagId: string) {
        const tagExists = await this.tagRepository.get(groupId, tagId)
        if (!tagExists) throw new TagNotFound({ groupId, tagId })
        await this.tagRepository.remove(groupId, tagId)
        return tagId
    }
}
