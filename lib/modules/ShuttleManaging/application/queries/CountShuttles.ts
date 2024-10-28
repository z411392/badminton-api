import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"

export type CountingShuttles = {
    search: string
}

export class CountShuttles extends CallableInstance<[string, CountingShuttles], Promise<number>> {
    protected logger: ConsolaInstance
    protected shuttleDao: ShuttleDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountShuttles`)
        this.shuttleDao = new ShuttleDao({ db })
    }
    async execute(userId: string, { search }: CountingShuttles) {
        const count = await this.shuttleDao.count({ search })
        return count
    }
}
