import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { VenueRepository } from "@/adapters/firestore/VenueRepository"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"

export class RemoveVenue extends CallableInstance<[string, string], Promise<{ venueId: string }>> {
    protected logger: ConsolaInstance
    protected venueRepository: VenueRepository
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveVenue`)
        this.venueRepository = new VenueRepository({ db, transaction })
    }
    async execute(userId: string, venueId: string) {
        const venueExists = await this.venueRepository.get(venueId)
        if (!venueExists) throw new VenueNotFound({ venueId })
        await this.venueRepository.remove(venueId)
        return venueId
    }
}
