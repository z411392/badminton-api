import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { type CountingVenues } from "@/modules/VenueManaging/application/queries/CountVenues"

export type ListingVenues = CountingVenues & {
    page: number
}

export class ListVenues extends CallableInstance<[string, ListingVenues], AsyncIterable<Venue>> {
    protected logger: ConsolaInstance
    protected venueDao: VenueDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListVenues`)
        this.venueDao = new VenueDao({ db })
    }
    async *execute(userId: string, { search, page }: ListingVenues) {
        const venueIds = await this.venueDao.search({ search }, page)
        if (venueIds.length === 0) return
        for await (const venue of this.venueDao.inIds(...venueIds)) yield venue
    }
}
