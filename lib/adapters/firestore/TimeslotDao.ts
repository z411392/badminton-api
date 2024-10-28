import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Timeslot, fromDocumentSnapshot } from "@/modules/MeetupManaging/dtos/Timeslot"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { PageSizes } from "@/constants"
import { Indexes } from "@/constants"

export class TimeslotDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }
    protected getCollection(groupId: string, meetupId: string) {
        return this.db.collection(Collections.Timeslots.replace(":groupId", groupId).replace(":meetupId", meetupId))
    }
    protected async *_inIds(groupId: string, meetupId: string, ...timeslotIds: string[]) {
        const documentsReference = this.getCollection(groupId, meetupId)
            .where(FieldPath.documentId(), "in", timeslotIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }
    async *inIds(groupId: string, meetupId: string, ...allTimeslotIds: string[]) {
        const batchSize = 30
        const mapping: { [timeslotId: string]: Timeslot } = {}
        for (let index = 0; index < allTimeslotIds.length; index += 30) {
            const timeslotIds = allTimeslotIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, meetupId, ...timeslotIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const timeslotId of allTimeslotIds) {
            const timeslot = mapping[timeslotId]
            if (!timeslot) continue
            yield timeslot
        }
    }
    async byId(groupId: string, meetupId: string, timeslotId: string) {
        let timeslot: Timeslot | undefined = undefined
        for await (const found of this.inIds(groupId, meetupId, timeslotId)) {
            timeslot = found
            break
        }
        return timeslot
    }
    async underMeetup(meetupId: string) {
        const page = 1
        const limit = PageSizes.Unlimited
        const indexName = Indexes.Timeslots
        const { hits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                attributesToHighlight: [],
                attributesToRetrieve: ["objectID"],
                hitsPerPage: limit,
                analytics: false,
                page: page - 1,
                facetFilters: [`meetupId:${meetupId}`],
            },
        })
        const timeslotIds = hits.map(({ objectID }) => objectID)
        return timeslotIds
    }
}
