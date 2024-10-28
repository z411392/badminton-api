import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { LevelRepository } from "@/adapters/firestore/LevelRepository"
import { type Level } from "@/modules/LevelManaging/dtos/Level"

export type CreatingLevel = {
    name: string
    order: number
    color: string
    description: string
}

export class CreateLevel extends CallableInstance<[string, string, CreatingLevel], Promise<{ levelId: string }>> {
    protected logger: ConsolaInstance
    protected levelRepository: LevelRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateLevel`)
        this.levelRepository = new LevelRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, { name, order, color, description }: CreatingLevel) {
        const levelId = LevelRepository.nextId(groupId)
        const level: Level = {
            id: levelId,
            name,
            order,
            color,
            description,
        }
        await this.levelRepository.set(groupId, levelId, level)
        return levelId
    }
}
