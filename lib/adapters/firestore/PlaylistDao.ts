import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Playlist, fromDocumentSnapshot } from "@/modules/PlaylistManaging/dtos/Playlist"
import { PageSizes } from "@/constants"
import { searchClient, type SearchClient } from "@algolia/client-search"
import { Indexes } from "@/constants"

export class PlaylistDao {
    protected db: Firestore
    protected searchClient: SearchClient
    constructor({ db }: { db: Firestore }) {
        this.db = db
        this.searchClient = searchClient(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_APP_KEY!)
    }

    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Playlists.replace(":groupId", groupId))
    }

    protected async *_inIds(groupId: string, ...playlistIds: string[]) {
        const documentsReference = this.getCollection(groupId)
            .where(FieldPath.documentId(), "in", playlistIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, ...allPlaylistIds: string[]) {
        const batchSize = 30
        const mapping: { [playlistId: string]: Playlist } = {}
        for (let index = 0; index < allPlaylistIds.length; index += 30) {
            const playlistIds = allPlaylistIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, ...playlistIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const playlistId of allPlaylistIds) {
            const playlist = mapping[playlistId]
            if (!playlist) continue
            yield playlist
        }
    }

    async byId(groupId: string, playlistId: string) {
        let playlist: Playlist | undefined = undefined
        for await (const found of this.inIds(groupId, playlistId)) {
            playlist = found
            break
        }
        return playlist
    }

    async count({ groupId, search }: { groupId: string; search: string }) {
        const indexName = Indexes.Playlists
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
        limit: number = PageSizes.Playlists,
    ) {
        const indexName = Indexes.Playlists
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
        const playlistIds = hits.map(({ objectID }) => objectID)
        return playlistIds
    }
}
