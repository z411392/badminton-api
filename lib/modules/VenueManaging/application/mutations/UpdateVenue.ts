import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { VenueConflict } from "@/modules/VenueManaging/errors/VenueConflict"
import { VenueRepository } from "@/adapters/firestore/VenueRepository"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"

export type UpdatingVenue = {
    name: string
    address: string
    building: string
    floor: number
    latitude: number
    longitude: number
}

export class UpdateVenue extends CallableInstance<[string, string, UpdatingVenue], Promise<{ venueId: string }>> {
    protected logger: ConsolaInstance
    protected venueDao: VenueDao
    protected venueRepository: VenueRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateVenue`)
        this.venueDao = new VenueDao({ db })
        this.venueRepository = new VenueRepository({ db, transaction })
    }
    async execute(
        userId: string,
        venueId: string,
        { name, address, building, floor, latitude, longitude }: UpdatingVenue,
    ) {
        const anotherVenueId = await this.venueDao.findOne({ name })
        if (anotherVenueId && anotherVenueId !== venueId) throw new VenueConflict({ name })
        const venueExists = await this.venueRepository.get(venueId)
        if (!venueExists) throw new VenueNotFound({ venueId })
        const venue: Venue = {
            ...venueExists,
            name,
            address,
            building,
            floor,
            latitude,
            longitude,
        }
        await this.venueRepository.set(venueId, venue)
        return venueId
    }
}
