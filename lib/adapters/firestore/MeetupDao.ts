import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Meetup, fromDocumentSnapshot } from "@/modules/MeetupManaging/dtos/Meetup"
import { PageSizes } from "@/constants"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class MeetupDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Meetups.replace(":groupId", groupId))
    }
    protected async *_inIds(groupId: string, ...meetupIds: string[]) {
        const documentsReference = this.getCollection(groupId)
            .where(FieldPath.documentId(), "in", meetupIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }
    async *inIds(groupId: string, ...allMeetupIds: string[]) {
        const batchSize = 30
        const mapping: { [meetupId: string]: Meetup } = {}
        for (let index = 0; index < allMeetupIds.length; index += 30) {
            const meetupIds = allMeetupIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, ...meetupIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const meetupId of allMeetupIds) {
            const meetup = mapping[meetupId]
            if (!meetup) continue
            yield meetup
        }
    }
    async byId(groupId: string, meetupId: string) {
        let meetup: Meetup | undefined = undefined
        for await (const found of this.inIds(groupId, meetupId)) {
            meetup = found
            break
        }
        return meetup
    }
    async count({ groupId, search }: { groupId: string; search: string }) {
        const indexName = Indexes.Meetups
        const { nbHits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                query: search,
                attributesToRetrieve: [],
                attributesToHighlight: [],
                hitsPerPage: 0,
                analytics: false,
                facetFilters: [`groupId:${groupId}`],
            },
        })
        return nbHits
    }
    async search(
        { groupId, search }: { groupId: string; search: string },
        page: number,
        limit: number = PageSizes.Meetups,
    ) {
        const indexName = Indexes.Meetups
        const { hits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                attributesToHighlight: [],
                attributesToRetrieve: ["objectID"],
                hitsPerPage: limit,
                analytics: false,
                page: page - 1,
                query: search,
                facetFilters: [`groupId:${groupId}`],
            },
        })
        const meetupIds = hits.map(({ objectID }) => objectID)
        return meetupIds
    }
}
