import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { LevelRepository } from "@/adapters/firestore/LevelRepository"
import { type Level } from "@/modules/LevelManaging/dtos/Level"
import { LevelNotFound } from "@/modules/LevelManaging/errors/LevelNotFound"

export type UpdatingLevel = {
    name: string
    order: number
    color: string
    description: string
}

export class UpdateLevel extends CallableInstance<
    [string, string, string, UpdatingLevel],
    Promise<{ levelId: string }>
> {
    protected logger: ConsolaInstance
    protected levelRepository: LevelRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateLevel`)
        this.levelRepository = new LevelRepository({ db, transaction })
    }
    async execute(
        userId: string,
        groupId: string,
        levelId: string,
        { name, order, color, description }: UpdatingLevel,
    ) {
        const levelExists = await this.levelRepository.get(groupId, levelId)
        if (!levelExists) throw new LevelNotFound({ levelId })
        const level: Level = {
            ...levelExists,
            name,
            order,
            color,
            description,
        }
        await this.levelRepository.set(groupId, levelId, level)
        return levelId
    }
}
