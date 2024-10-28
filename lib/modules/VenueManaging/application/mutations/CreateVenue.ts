import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { VenueConflict } from "@/modules/VenueManaging/errors/VenueConflict"
import { VenueRepository } from "@/adapters/firestore/VenueRepository"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"

export type CreatingVenue = {
    name: string
    address: string
    building: string
    floor: number
    latitude: number
    longitude: number
}

export class CreateVenue extends CallableInstance<[string, CreatingVenue], Promise<{ venueId: string }>> {
    protected logger: ConsolaInstance
    protected venueDao: VenueDao
    protected venueRepository: VenueRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateVenue`)
        this.venueDao = new VenueDao({ db })
        this.venueRepository = new VenueRepository({ db, transaction })
    }
    async execute(userId: string, { name, address, building, floor, latitude, longitude }: CreatingVenue) {
        const anotherVenueId = await this.venueDao.findOne({ name })
        if (anotherVenueId) throw new VenueConflict({ name })
        const venueId = VenueRepository.nextId()
        const venue: Venue = {
            id: venueId,
            name,
            address,
            building,
            floor,
            latitude,
            longitude,
        }
        await this.venueRepository.set(venueId, { ...venue })
        return venueId
    }
}
