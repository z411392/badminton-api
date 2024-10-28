import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { ShuttleConflict } from "@/modules/ShuttleManaging/errors/ShuttleConflict"
import { ShuttleRepository } from "@/adapters/firestore/ShuttleRepository"
import { type Shuttle } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { ShuttleNotFound } from "@/modules/ShuttleManaging/errors/ShuttleNotFound"

export type UpdatingShuttle = {
    brand: string
    name: string
}

export class UpdateShuttle extends CallableInstance<[string, string, UpdatingShuttle], Promise<{ shuttleId: string }>> {
    protected logger: ConsolaInstance
    protected shuttleDao: ShuttleDao
    protected shuttleRepository: ShuttleRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateShuttle`)
        this.shuttleDao = new ShuttleDao({ db })
        this.shuttleRepository = new ShuttleRepository({ db, transaction })
    }
    async execute(userId: string, shuttleId: string, { brand, name }: UpdatingShuttle) {
        const anotherShuttleId = await this.shuttleDao.findOne({ brand, name })
        if (anotherShuttleId && anotherShuttleId !== shuttleId) throw new ShuttleConflict({ brand, name })
        const shuttleExists = await this.shuttleRepository.get(shuttleId)
        if (!shuttleExists) throw new ShuttleNotFound({ shuttleId })
        const shuttle: Shuttle = {
            ...shuttleExists,
            brand,
            name,
        }
        await this.shuttleRepository.set(shuttleId, shuttle)
        return shuttleId
    }
}
