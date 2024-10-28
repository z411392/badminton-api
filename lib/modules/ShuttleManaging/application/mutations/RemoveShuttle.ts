import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { ShuttleRepository } from "@/adapters/firestore/ShuttleRepository"
import { ShuttleNotFound } from "@/modules/ShuttleManaging/errors/ShuttleNotFound"

export class RemoveShuttle extends CallableInstance<[string, string], Promise<{ shuttleId: string }>> {
    protected logger: ConsolaInstance
    protected shuttleRepository: ShuttleRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveShuttle`)
        this.shuttleRepository = new ShuttleRepository({ db, transaction })
    }
    async execute(userId: string, shuttleId: string) {
        const shuttleExists = await this.shuttleRepository.get(shuttleId)
        if (!shuttleExists) throw new ShuttleNotFound({ shuttleId })
        await this.shuttleRepository.remove(shuttleId)
        return shuttleId
    }
}
