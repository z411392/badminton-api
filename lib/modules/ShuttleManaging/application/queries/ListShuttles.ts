import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { type Shuttle } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { type CountingShuttles } from "@/modules/ShuttleManaging/application/queries/CountShuttles"

export type ListingShuttles = CountingShuttles & {
    page: number
}

export class ListShuttles extends CallableInstance<[string, ListingShuttles], AsyncIterable<Shuttle>> {
    protected logger: ConsolaInstance
    protected shuttleDao: ShuttleDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListShuttles`)
        this.shuttleDao = new ShuttleDao({ db })
    }
    async *execute(userId: string, { search, page }: ListingShuttles) {
        const shuttleIds = await this.shuttleDao.search({ search }, page)
        if (shuttleIds.length === 0) return
        for await (const shuttle of this.shuttleDao.inIds(...shuttleIds)) yield shuttle
    }
}
