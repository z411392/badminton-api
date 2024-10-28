import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Tag, fromDocumentSnapshot } from "@/modules/TagManaging/dtos/Tag"
import { PageSizes } from "@/constants"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class TagDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }

    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Tags.replace(":groupId", groupId))
    }

    protected async *_inIds(groupId: string, ...tagIds: string[]) {
        const documentsReference = this.getCollection(groupId)
            .where(FieldPath.documentId(), "in", tagIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, ...allTagIds: string[]) {
        const batchSize = 30
        const mapping: { [tagId: string]: Tag } = {}
        for (let index = 0; index < allTagIds.length; index += 30) {
            const tagIds = allTagIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, ...tagIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const tagId of allTagIds) {
            const tag = mapping[tagId]
            if (!tag) continue
            yield tag
        }
    }

    async byId(groupId: string, tagId: string) {
        let tag: Tag | undefined = undefined
        for await (const found of this.inIds(groupId, tagId)) {
            tag = found
            break
        }
        return tag
    }

    async count({ groupId, search }: { groupId: string; search: string }) {
        const indexName = Indexes.Tags
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
        limit: number = PageSizes.Tags,
    ) {
        const indexName = Indexes.Tags
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
        const tagIds = hits.map(({ objectID }) => objectID)
        return tagIds
    }
}
