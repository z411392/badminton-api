import { type Firestore, type Transaction, GeoPoint } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Collections } from "@/constants"
import { type Venue, fromDocumentSnapshot } from "@/modules/VenueManaging/dtos/Venue"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"
export class VenueRepository {
    protected db: Firestore
    protected transaction: Transaction
    protected searchClient: SearchClient
    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        this.db = db
        this.transaction = transaction
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    static nextId() {
        const namespace = uuid5(Collections.Venues, process.env.PROJECT_UUID!)
        return uuid5(uuid1(), namespace)
    }
    protected getCollection() {
        return this.db.collection(Collections.Venues)
    }
    async get(venueId: string) {
        const collection = this.getCollection()
        const documentSnapshot = await this.transaction.get(collection.doc(venueId))
        return documentSnapshot.exists ? fromDocumentSnapshot(documentSnapshot) : undefined
    }
    protected locationFor({ address, building, floor }: Venue) {
        let location = address
        if (building) location += ` ${building}`
        if (floor && floor !== 1) {
            if (floor > 0) location += ` ${floor} 樓`
            else location += ` 地下 ${Math.abs(floor)} 樓`
        }
        return location
    }
    protected async saveToSearchEngine(venue: Venue) {
        const { id, name, latitude, longitude, createdAt, updatedAt } = venue
        const now = Date.now()
        const location = this.locationFor(venue)
        const indexName = Indexes.Venues
        const { taskID } = await this.searchClient.saveObject({
            indexName,
            body: {
                objectID: id,
                name,
                location,
                _geoloc: {
                    lat: latitude,
                    lng: longitude,
                },
                createdAt: createdAt ? createdAt : now,
                updatedAt: updatedAt ? createdAt : now,
            },
        })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async set(venueId: string, venue: Venue) {
        const collection = this.getCollection()
        const { id, createdAt, updatedAt, latitude, longitude, ...documentData } = venue
        const geopoint = new GeoPoint(latitude, longitude)
        this.transaction.set(collection.doc(venueId), { ...documentData, geopoint }, { merge: true })
        await this.saveToSearchEngine(venue)
    }
    protected async removeFromSearchEngine(venueId: string) {
        const indexName = Indexes.Venues
        const { taskID } = await this.searchClient.deleteObject({ indexName, objectID: venueId })
        await this.searchClient.waitForTask({ indexName, taskID })
    }
    async remove(venueId: string) {
        const collection = this.getCollection()
        this.transaction.delete(collection.doc(venueId))
        await this.removeFromSearchEngine(venueId)
    }
}
