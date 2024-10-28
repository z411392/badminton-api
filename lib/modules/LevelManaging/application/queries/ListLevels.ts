import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type Level } from "@/modules/LevelManaging/dtos/Level"
import { LevelDao } from "@/adapters/firestore/LevelDao"

export class ListLevels extends CallableInstance<[string, string], AsyncIterable<Level>> {
    protected logger: ConsolaInstance
    protected levelDao: LevelDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListLevels`)
        this.levelDao = new LevelDao({ db })
    }
    async *execute(userId: string, groupId: string) {
        const levelIds = await this.levelDao.search({ groupId })
        if (levelIds.length === 0) return
        for await (const level of this.levelDao.inIds(groupId, ...levelIds)) yield level
    }
}
