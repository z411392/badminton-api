import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { VenueDao } from "@/adapters/firestore/VenueDao"

export type CountingVenues = {
    search: string
}

export class CountVenues extends CallableInstance<[string, CountingVenues], Promise<number>> {
    protected logger: ConsolaInstance
    protected venueDao: VenueDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountVenues`)
        this.venueDao = new VenueDao({ db })
    }
    async execute(userId: string, { search }: CountingVenues) {
        const count = await this.venueDao.count({ search })
        return count
    }
}
