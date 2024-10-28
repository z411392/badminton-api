import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Shuttle, fromDocumentSnapshot } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { PageSizes } from "@/constants"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class ShuttleDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }

    protected getCollection() {
        return this.db.collection(Collections.Shuttles)
    }

    protected async *_inIds(...shuttleIds: string[]) {
        const documentsReference = this.getCollection()
            .where(FieldPath.documentId(), "in", shuttleIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(...allShuttleIds: string[]) {
        const batchSize = 30
        const mapping: { [shuttleId: string]: Shuttle } = {}
        for (let index = 0; index < allShuttleIds.length; index += 30) {
            const shuttleIds = allShuttleIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(...shuttleIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const shuttleId of allShuttleIds) {
            const shuttle = mapping[shuttleId]
            if (!shuttle) continue
            yield shuttle
        }
    }

    async byId(shuttleId: string) {
        let shuttle: Shuttle | undefined = undefined
        for await (const found of this.inIds(shuttleId)) {
            shuttle = found
            break
        }
        return shuttle
    }

    async findOne({ brand, name }: { brand: string; name: string }) {
        const documentsReference = this.getCollection()
            .where("brand", "==", brand)
            .where("name", "==", name)
            .limit(1)
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) return documentSnapshot.id
        return undefined
    }

    async count({ search }: { search: string }) {
        const indexName = Indexes.Shuttles
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
    async search({ search }: { search: string }, page: number, limit: number = PageSizes.Shuttles) {
        const indexName = Indexes.Shuttles
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
        const shuttleIds = hits.map(({ objectID }) => objectID)
        return shuttleIds
    }
}
