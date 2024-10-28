import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections, PageSizes } from "@/constants"
import { type Venue, fromDocumentSnapshot } from "@/modules/VenueManaging/dtos/Venue"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"
export class VenueDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    protected getCollection() {
        return this.db.collection(Collections.Venues)
    }
    async findOne({ name }: { name: string }) {
        const collection = this.getCollection()
        const documentsReference = collection
            .where("name", "==", name)
            .limit(1)
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) return documentSnapshot.id
        return undefined
    }
    async count({ search }: { search: string }) {
        const indexName = Indexes.Venues
        const { nbHits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                query: search,
                attributesToRetrieve: [],
                attributesToHighlight: [],
                hitsPerPage: 0,
                analytics: false,
            },
        })
        return nbHits
    }
    async search({ search }: { search: string }, page: number, limit: number = PageSizes.Venues) {
        const indexName = Indexes.Venues
        const { hits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                attributesToHighlight: [],
                attributesToRetrieve: ["objectID"],
                hitsPerPage: limit,
                analytics: false,
                page: page - 1,
                query: search,
            },
        })
        const venueIds = hits.map(({ objectID }) => objectID)
        return venueIds
    }
    protected async *_inIds(...venueIds: string[]) {
        const collection = this.getCollection()
        const documentsReference = collection
            .where(FieldPath.documentId(), "in", venueIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }
    async *inIds(...allVenueIds: string[]) {
        const batchSize = 30
        const mapping: { [venueId: string]: Venue } = {}
        for (let index = 0; index < allVenueIds.length; index += 30) {
            const venueIds = allVenueIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(...venueIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const venueId of allVenueIds) {
            const venue = mapping[venueId]
            if (!venue) continue
            yield venue
        }
    }
    async byId(venueId: string) {
        let venue: Venue | undefined = undefined
        for await (const found of this.inIds(venueId)) {
            venue = found
            break
        }
        return venue
    }
}
