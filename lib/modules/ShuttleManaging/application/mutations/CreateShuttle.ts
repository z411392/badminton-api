import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { ShuttleConflict } from "@/modules/ShuttleManaging/errors/ShuttleConflict"
import { ShuttleRepository } from "@/adapters/firestore/ShuttleRepository"
import { type Shuttle } from "@/modules/ShuttleManaging/dtos/Shuttle"

export type CreatingShuttle = {
    brand: string
    name: string
}

export class CreateShuttle extends CallableInstance<[string, CreatingShuttle], Promise<{ shuttleId: string }>> {
    protected logger: ConsolaInstance
    protected shuttleDao: ShuttleDao
    protected shuttleRepository: ShuttleRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateShuttle`)
        this.shuttleDao = new ShuttleDao({ db })
        this.shuttleRepository = new ShuttleRepository({ db, transaction })
    }
    async execute(userId: string, { brand, name }: CreatingShuttle) {
        const anotherOneShuttleId = await this.shuttleDao.findOne({ brand, name })
        if (anotherOneShuttleId) throw new ShuttleConflict({ brand, name })
        const shuttleId = ShuttleRepository.nextId()
        const shuttle: Shuttle = {
            id: shuttleId,
            brand,
            name,
        }
        await this.shuttleRepository.set(shuttleId, shuttle)
        return shuttleId
    }
}
