import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { LevelRepository } from "@/adapters/firestore/LevelRepository"
import { LevelNotFound } from "@/modules/LevelManaging/errors/LevelNotFound"

export class RemoveLevel extends CallableInstance<[string, string, string], Promise<{ levelId: string }>> {
    protected logger: ConsolaInstance
    protected levelRepository: LevelRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveLevel`)
        this.levelRepository = new LevelRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, levelId: string) {
        const levelExists = await this.levelRepository.get(groupId, levelId)
        if (!levelExists) throw new LevelNotFound({ levelId })
        await this.levelRepository.remove(groupId, levelId)
        return levelId
    }
}
