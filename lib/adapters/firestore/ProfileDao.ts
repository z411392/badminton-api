import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Profile, fromDocumentSnapshot } from "@/modules/ProfileManaging/dtos/Profile"
import { PageSizes } from "@/constants"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class ProfileDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }

    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Profiles.replace(":groupId", groupId))
    }

    protected async *_inIds(groupId: string, ...profileIds: string[]) {
        const documentsReference = this.getCollection(groupId)
            .where(FieldPath.documentId(), "in", profileIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, ...allProfileIds: string[]) {
        const batchSize = 30
        const mapping: { [profileId: string]: Profile } = {}
        for (let index = 0; index < allProfileIds.length; index += 30) {
            const profileIds = allProfileIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, ...profileIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const profileId of allProfileIds) {
            const profile = mapping[profileId]
            if (!profile) continue
            yield profile
        }
    }

    async byId(groupId: string, profileId: string) {
        let profile: Profile | undefined = undefined
        for await (const found of this.inIds(groupId, profileId)) {
            profile = found
            break
        }
        return profile
    }

    async count({ groupId, search, levelIds = [] }: { groupId: string; search: string; levelIds: string[] }) {
        const indexName = Indexes.Profiles
        const { nbHits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                query: search,
                attributesToRetrieve: [],
                attributesToHighlight: [],
                hitsPerPage: 0,
                analytics: false,
                facetFilters: [`groupId:${groupId}`, levelIds.map((levelId) => `levelId:${levelId}`)],
            },
        })
        return nbHits
    }
    async search(
        {
            groupId,
            search,
            levelIds = [],
        }: {
            groupId: string
            search: string
            levelIds: string[]
        },
        page: number,
        limit: number = PageSizes.Profiles,
    ) {
        const indexName = Indexes.Profiles
        const { hits } = await this.searchClient.searchSingleIndex({
            indexName,
            searchParams: {
                attributesToHighlight: [],
                attributesToRetrieve: ["objectID"],
                hitsPerPage: limit,
                analytics: false,
                page: page - 1,
                query: search,
                facetFilters: [`groupId:${groupId}`, levelIds.map((levelId) => `levelId:${levelId}`)],
            },
        })
        const tagIds = hits.map(({ objectID }) => objectID)
        return tagIds
    }
}
